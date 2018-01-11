import { SqlAndParams } from './query-builder';
import { WhereBuilder, WhereCompiled } from "./where-builder";
import { ProjectionBuilder, ProjectionCompiled } from "./projection-builder";
import { ResultExecuteSql, QueryCompiled, IQueryCompilable, OrderBy, ValueType } from "./utils";
import { ExecutableBuilder } from "./executable-builder";
import { Expression, ExpressionUtils } from "lambda-expression";
import { Database } from './definitions/database-definition';

let NEXT_VALUE_ALIAS: number = 0;

export class QueryBuilder<T> implements IQueryCompilable {

    private readonly _executableBuilder: ExecutableBuilder;
    private readonly _expressionUtils: ExpressionUtils;

    private _tablename: string;
    private readonly _alias: string;
    public get alias(): string {
        return this._alias;
    }

    private _limit: string = "";
    private _orderBy: string = "";
    private _groupBy: string = "";

    private _whereCompiled: WhereCompiled = { where: "", params: [] };
    private _projectionCompiled: ProjectionCompiled = { projection: "", params: [] };

    private _joinsQuery: JoinQueryBuilder<any>[] = [];
    // TODO: remove "_joinParams" e utilizar SqlAndParams como é realizado nos projections
    private _joinParams: ValueType[] = [];

    private _unionsQuery: QueryCompiled[] = [];
    private _fromParams: ValueType[] = [];

    constructor(private _typeT: new () => T, alias: string = void 0, enableLog: boolean = true) {
        this._tablename = _typeT.name;
        if (!alias) {
            alias = this.createUniqueAlias(this.defaultAlias(_typeT));
        }
        if (this.hasAlias(alias)) {
            throw `Alias: ${alias} já está sendo utilizado nesse contexto de query (query: ${this.compile().query}).`;
        }
        this._alias = alias;
        this._executableBuilder = new ExecutableBuilder(enableLog);
        this._expressionUtils = new ExpressionUtils();
    }

    public clone(): QueryBuilder<T> {
        return Object.assign({ __proto__: (<any>this).__proto__ }, this);
    }

    public ref(expression: Expression<T>): string {
        return this.addAlias(this._expressionUtils.getColumnByExpression(expression));
    }

    private defaultAlias(typeT: new () => T) {
        if (typeT.name.length > 3) {
            return typeT.name.substring(0, 3);
        }
        return typeT.name;
    }

    public hasAlias(alias: string): boolean {
        if (this._alias == alias)
            return true;
        // check in joins
        for (var key in this._joinsQuery) {
            var joinQuery = this._joinsQuery[key];
            if (joinQuery.hasAlias(alias))
                return true;
        }
        return false;
    }

    private createUniqueAlias(aliasProposed: string): string {
        aliasProposed = aliasProposed ? aliasProposed.toLowerCase() : aliasProposed;
        if (this.hasAlias(aliasProposed)) {
            return this.createUniqueAlias(`${aliasProposed}${NEXT_VALUE_ALIAS++}`);
        }
        return aliasProposed;
    }

    public from(query: QueryCompiled): QueryBuilder<T> {
        this._tablename = `(${query.query})`;
        this._fromParams = query.params;
        return this;
    }

    public join<TJoin>(typeTJoin: new () => TJoin,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0): QueryBuilder<T> {
        let instanceJoin: JoinQueryBuilder<TJoin> = new JoinQueryBuilder(typeTJoin, onWhereCallback, type, alias);
        joinCallback(instanceJoin);
        this.addJoin(instanceJoin);
        return this;
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): QueryBuilder<T> {
        let instanceWhere: WhereBuilder<T> = new WhereBuilder(this._typeT, this.alias);
        whereCallback(instanceWhere);
        this.compileWhere(instanceWhere.compile());
        return this;
    }

    public projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): QueryBuilder<T> {
        let instanceProjection: ProjectionBuilder<T> = new ProjectionBuilder(this._typeT, this.alias);
        projectionCallback(instanceProjection);
        this.compileProjection(instanceProjection.compile());
        return this;
    }

    public limit(limit: number): QueryBuilder<T> {
        this._limit = ` LIMIT ${limit}`;
        return this;
    }

    // TODO: suportar expressão having: https://sqlite.org/lang_select.html
    public orderBy(expression: Expression<T>, order: OrderBy = OrderBy.ASC): QueryBuilder<T> {
        this.compileOrderBy(this.addAlias(this._expressionUtils.getColumnByExpression(expression)));
        return this;
    }

    public asc(expression: Expression<T>): QueryBuilder<T> {
        return this.orderBy(expression, OrderBy.ASC);
    }

    public desc(expression: Expression<T>): QueryBuilder<T> {
        return this.orderBy(expression, OrderBy.DESC);
    }

    public groupBy(expression: Expression<T>): QueryBuilder<T> {
        this.compileGroupBy(this.addAlias(this._expressionUtils.getColumnByExpression(expression)));
        return this;
    }

    public union(query: QueryCompiled): QueryBuilder<T> {
        this._unionsQuery.push(query);
        return this;
    }

    public execute(database: Database): Promise<ResultExecuteSql> {
        return this._executableBuilder.execute(this.compile(), database);
    }

    private readonly WHERE = " WHERE ";
    private readonly GROUP_BY = " GROUP BY ";
    private readonly ORDER_BY = " ORDER BY ";

    public compile(): QueryCompiled {
        let sqlBase: SqlAndParams = this.buildSelectBase();
        let buildWhere = () => this._whereCompiled.where.length > 0 ? `${this.WHERE}${this._whereCompiled.where}` : "";
        let buildGroupBy = () => this._groupBy.length > 0 ? `${this.GROUP_BY}${this._groupBy}` : "";
        let buildOrderBy = () => this._orderBy.length > 0 ? `${this.ORDER_BY}${this._orderBy}` : "";
        return this.buildUnions({
            query: `${sqlBase.sql}${buildWhere()}${buildGroupBy()}${buildOrderBy()}${this._limit}`,
            params: sqlBase.params.concat(this._joinParams.concat(this._whereCompiled.params))
        });
    }

    private buildUnions(queryBase: QueryCompiled): QueryCompiled {
        for (var key in this._unionsQuery) {
            let unionQuery = this._unionsQuery[key];
            queryBase.query += ` UNION ${unionQuery.query}`;
            queryBase.params = queryBase.params.concat(unionQuery.params);
        }
        return queryBase;
    }

    private addAlias(column: string): string {
        return `${this._alias}.${column}`
    }

    private addJoin<TJoin>(joinQuery: JoinQueryBuilder<TJoin>) {
        this._joinsQuery.push(joinQuery);
        this.compileWhere(joinQuery._whereCompiled);
        this.compileProjection(joinQuery._projectionCompiled);
        this.compileGroupBy(joinQuery._groupBy);
        this.compileOrderBy(joinQuery._orderBy);
    }

    private compileGroupBy(groupBy: string) {
        if (groupBy && groupBy.length) {
            this._groupBy += `${this._groupBy.length ? ", " : ""}${groupBy}`;
        }
    }

    private compileOrderBy(orderBy: string) {
        if (orderBy && orderBy.length) {
            this._orderBy += `${this._orderBy.length ? ", " : ""}${orderBy}`;
        }
    }

    private compileWhere(compiled: WhereCompiled) {
        if (compiled.where.length) {
            this._whereCompiled.where += `${(this._whereCompiled.where.length ? " AND " : "")}${compiled.where}`;
            compiled.params.forEach(value => {
                this._whereCompiled.params.push(value);
            });
        }
    }

    private compileProjection(compiled: ProjectionCompiled) {
        if (compiled.projection.length) {
            this._projectionCompiled.projection += `${(this._projectionCompiled.projection.length ? ", " : "")}${compiled.projection}`;
            compiled.params.forEach(value => {
                this._projectionCompiled.params.push(value);
            });
        }
    }

    private buildSelectBase(): SqlAndParams {
        if (!this._projectionCompiled.projection.length) {
            this.projection(projection => projection.all());
        }

        let tablenameAndJoins: SqlAndParams = { sql: this.compileTable(), params: this._fromParams };
        for (var key in this._joinsQuery) {
            var joinQuery = this._joinsQuery[key];
            tablenameAndJoins = this.compileTableJoins(tablenameAndJoins, joinQuery);
        }

        this._joinParams = tablenameAndJoins.params;

        return <SqlAndParams>{
            sql: `SELECT ${this._projectionCompiled.projection} FROM ${tablenameAndJoins.sql}`,
            params: this._projectionCompiled.params
        };
    }

    public compileTable(): string {
        return `${this._tablename} AS ${this._alias}`;
    }

    private compileTableJoins<TJoin>(tablesBase: SqlAndParams, join: JoinQueryBuilder<TJoin>): SqlAndParams {
        let onWhereCompiled = join.onWhere.compile();
        return {
            sql: `${tablesBase.sql} ${join.type} JOIN ${join.compileTable()} ON (${onWhereCompiled.where})`,
            params: tablesBase.params.concat(onWhereCompiled.params)
        };
    }
}

export class JoinQueryBuilder<T> extends QueryBuilder<T>{
    private readonly _onWhere: WhereBuilder<T>;
    public get onWhere(): WhereBuilder<T> {
        return this._onWhere;
    }

    constructor(typeT: new () => T, onWhereCallback: (where: WhereBuilder<T>) => void, public type: JoinType = JoinType.LEFT, alias: string = void 0, enableLog: boolean = true) {
        super(typeT, alias, enableLog);

        this._onWhere = new WhereBuilder(typeT, this.alias);
        onWhereCallback(this._onWhere);
    }

    public join<TJoin>(typeTJoin: new () => TJoin, onWhereCallback: (where: WhereBuilder<TJoin>) => void, joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void): QueryBuilder<T> {
        throw "Not allowed to add a join inside another join. Please add the joins only in the root query.";
    }

    public limit(limit: number): QueryBuilder<T> {
        throw "Not allowed to specify limit in join query.";
    }
}

export enum JoinType {
    // NONE = "",
    INNER = "INNER",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
    FULL_OUTER = "FULL OUTER",
    CROSS = "CROSS"
    // LEFT_OUTER = "LEFT OUTER"
}

export interface SqlAndParams {
    sql: string;
    params: ValueType[];
}