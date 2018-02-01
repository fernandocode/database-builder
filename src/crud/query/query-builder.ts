import { ResultExecuteSql } from "./../../core/result-execute-sql";
import { QueryCompiled } from "./../../core/query-compiled";
import { ExecutableBuilder } from "./../../core/executable-builder";
import { ProjectionBuilder } from "./../projection-builder";
import { ExpressionOrColumn, Utils, ValueType } from "./../../core/utils";
import { Database } from "./../../definitions/database-definition";
import { WhereBuilder } from "../where-builder";
import { QueryCompilable } from "../../core/query-compilable";
import { OrderBy } from "../../core/enums/order-by";
import { WhereCompiled } from "../where-compiled";
// import { JoinQueryBuilder } from "./join-query-builder";
import { JoinType } from "../enums/join-type";
import { SqlAndParams } from "../sql-and-params";
import { ProjectionCompiled } from "../projection-compiled";
import { LambdaExpression } from "lambda-expression";

let NEXT_VALUE_ALIAS: number = 0;

export class QueryBuilder<T> implements QueryCompilable {

    public get alias(): string {
        return this._alias;
    }

    private readonly _executableBuilder: ExecutableBuilder;

    private readonly WHERE = " WHERE ";
    private readonly GROUP_BY = " GROUP BY ";
    private readonly ORDER_BY = " ORDER BY ";

    private _limit: string = "";
    private _orderBy: string = "";
    private _groupBy: string = "";

    private _whereCompiled: WhereCompiled = { where: "", params: [] };
    private _projectionCompiled: ProjectionCompiled = { projection: "", params: [] };

    private _joinsQuery: Array<JoinQueryBuilder<any>> = [];
    // TODO: remove "_joinParams" e utilizar SqlAndParams como é realizado nos projections
    private _joinParams: ValueType[] = [];

    private _unionsQuery: QueryCompiled[] = [];
    private _fromParams: ValueType[] = [];

    private _tablename: string;
    private readonly _alias: string;

    constructor(protected _typeT: new () => T, alias: string = void 0, enableLog: boolean = true) {
        this._tablename = _typeT.name;
        if (!alias) {
            alias = this.createUniqueAlias(this.defaultAlias(_typeT));
        }
        if (this.hasAlias(alias)) {
            throw new Error(`Alias: ${alias} já está sendo utilizado nesse contexto de query
            (query: ${this.compile().query}).`);
        }
        this._alias = alias;
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public clone(): QueryBuilder<T> {
        return Object.assign({ __proto__: (this as any).__proto__ }, this);
    }

    public ref(expression: ExpressionOrColumn<T>): string {
        return this.addAlias(Utils.getColumn(expression));
    }

    public hasAlias(alias: string): boolean {
        if (this._alias === alias) {
            return true;
        }
        // check in joins
        for (const key in this._joinsQuery) {
            if (this._joinsQuery.hasOwnProperty(key)) {
                const joinQuery = this._joinsQuery[key];
                if (joinQuery.hasAlias(alias)) {
                    return true;
                }
            }
        }
        return false;
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
        const instanceJoin: JoinQueryBuilder<TJoin> = new JoinQueryBuilder(typeTJoin, onWhereCallback, type, alias);
        joinCallback(instanceJoin);
        this.addJoin(instanceJoin);
        return this;
    }

    public createWhere(): WhereBuilder<T> {
        return new WhereBuilder(this._typeT, this.alias);
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): QueryBuilder<T> {
        const instanceWhere: WhereBuilder<T> = this.createWhere();
        whereCallback(instanceWhere);
        this.compileWhere(instanceWhere.compile());
        return this;
    }

    public whereExp(expression: LambdaExpression<T>): QueryBuilder<T> {
        const instanceWhere: WhereBuilder<T> = this.createWhere();
        instanceWhere.expression(expression);
        this.compileWhere(instanceWhere.compile());
        return this;
    }

    /**
     * @deprecated Use `select`
     * @param projectionCallback 
     */
    public projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): QueryBuilder<T> {
        return this.select(projectionCallback);
        // const instanceProjection: ProjectionBuilder<T> = new ProjectionBuilder(this._typeT, this.alias);
        // projectionCallback(instanceProjection);
        // this.compileProjection(instanceProjection.compile());
        // return this;
    }

    public select(selectCallback: (select: ProjectionBuilder<T>) => void): QueryBuilder<T> {
        const instanceProjection: ProjectionBuilder<T> = this.createProjectionBuilder();
        selectCallback(instanceProjection);
        this.compileProjection(instanceProjection.compile());
        return this;
    }

    public limit(limit: number): QueryBuilder<T> {
        this._limit = ` LIMIT ${limit}`;
        return this;
    }

    // TODO: suportar expressão having: https://sqlite.org/lang_select.html
    public orderBy(expression: ExpressionOrColumn<T>, order: OrderBy = OrderBy.ASC): QueryBuilder<T> {
        this.compileOrderBy(this.addAlias(Utils.getColumn(expression)));
        return this;
    }

    public asc(expression: ExpressionOrColumn<T>): QueryBuilder<T> {
        return this.orderBy(expression, OrderBy.ASC);
    }

    public desc(expression: ExpressionOrColumn<T>): QueryBuilder<T> {
        return this.orderBy(expression, OrderBy.DESC);
    }

    public groupBy(expression: ExpressionOrColumn<T>): QueryBuilder<T> {
        this.compileGroupBy(this.addAlias(Utils.getColumn(expression)));
        return this;
    }

    public union(query: QueryCompiled): QueryBuilder<T> {
        this._unionsQuery.push(query);
        return this;
    }

    public execute(database: Database): Promise<ResultExecuteSql> {
        return this._executableBuilder.execute(this.compile(), database);
    }

    public compileTable(): string {
        return `${this._tablename} AS ${this._alias}`;
    }

    public compile(): QueryCompiled {
        const sqlBase: SqlAndParams = this.buildSelectBase();
        const buildWhere = () =>
            this._whereCompiled.where.length > 0
                ? `${this.WHERE}${this._whereCompiled.where}`
                : "";
        const buildGroupBy = () =>
            this._groupBy.length > 0
                ? `${this.GROUP_BY}${this._groupBy}`
                : "";
        const buildOrderBy = () =>
            this._orderBy.length > 0
                ? `${this.ORDER_BY}${this._orderBy}`
                : "";
        return this.buildUnions({
            params: sqlBase.params.concat(this._joinParams.concat(this._whereCompiled.params)),
            query: `${sqlBase.sql}${buildWhere()}${buildGroupBy()}${buildOrderBy()}${this._limit}`,
        });
    }

    protected createProjectionBuilder(): ProjectionBuilder<T>{
        return new ProjectionBuilder(this._typeT, this.alias)
    }

    private createUniqueAlias(aliasProposed: string): string {
        aliasProposed = aliasProposed ? aliasProposed.toLowerCase() : aliasProposed;
        if (this.hasAlias(aliasProposed)) {
            return this.createUniqueAlias(`${aliasProposed}${NEXT_VALUE_ALIAS++}`);
        }
        return aliasProposed;
    }

    private buildUnions(queryBase: QueryCompiled): QueryCompiled {
        for (const key in this._unionsQuery) {
            if (this._unionsQuery.hasOwnProperty(key)) {
                const unionQuery = this._unionsQuery[key];
                queryBase.query += ` UNION ${unionQuery.query}`;
                queryBase.params = queryBase.params.concat(unionQuery.params);
            }
        }
        return queryBase;
    }

    private addAlias(column: string): string {
        return `${this._alias}.${column}`;
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
            this._whereCompiled.where +=
                `${(this._whereCompiled.where.length ? " AND " : "")}${compiled.where}`;
            compiled.params.forEach((value) => {
                this._whereCompiled.params.push(value);
            });
        }
    }

    private compileProjection(compiled: ProjectionCompiled) {
        if (compiled.projection.length) {
            this._projectionCompiled.projection +=
                `${(this._projectionCompiled.projection.length ? ", " : "")}${compiled.projection}`;
            compiled.params.forEach((value: any) => {
                this._projectionCompiled.params.push(value);
            });
        }
    }

    private buildSelectBase(): SqlAndParams {
        if (!this._projectionCompiled.projection.length) {
            this.projection((projection) => projection.all());
        }

        let tablenameAndJoins: SqlAndParams = { sql: this.compileTable(), params: this._fromParams };
        for (const key in this._joinsQuery) {
            if (this._joinsQuery.hasOwnProperty(key)) {
                const joinQuery = this._joinsQuery[key];
                tablenameAndJoins = this.compileTableJoins(tablenameAndJoins, joinQuery);
            }
        }

        this._joinParams = tablenameAndJoins.params;

        return {
            params: this._projectionCompiled.params,
            sql: `SELECT ${this._projectionCompiled.projection} FROM ${tablenameAndJoins.sql}`,
        } as SqlAndParams;
    }

    private compileTableJoins<TJoin>(tablesBase: SqlAndParams, join: JoinQueryBuilder<TJoin>): SqlAndParams {
        const onWhereCompiled = join.onWhere.compile();
        return {
            params: tablesBase.params.concat(onWhereCompiled.params),
            sql: `${tablesBase.sql} ${join.type} JOIN ${join.compileTable()} ON (${onWhereCompiled.where})`,
        };
    }

    private defaultAlias(typeT: new () => T) {
        if (typeT.name.length > 3) {
            return typeT.name.substring(0, 3);
        }
        return typeT.name;
    }
}

export class JoinQueryBuilder<T> extends QueryBuilder<T> {
    
    private readonly _onWhere: WhereBuilder<T>;
    public get onWhere(): WhereBuilder<T> {
        return this._onWhere;
    }

    constructor(
        typeT: new () => T,
        onWhereCallback: (where: WhereBuilder<T>) => void,
        public type: JoinType = JoinType.LEFT,
        alias: string = void 0,
        enableLog: boolean = true,
    ) {
        super(typeT, alias, enableLog);

        this._onWhere = new WhereBuilder(typeT, this.alias);
        onWhereCallback(this._onWhere);
    }

    public join<TJoin>(
        typeTJoin: new () => TJoin,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
    ): QueryBuilder<T> {
        throw new Error("Not allowed to add a join inside another join. Please add the joins only in the root query.");
    }

    public limit(
        limit: number,
    ): QueryBuilder<T> {
        throw new Error("Not allowed to specify limit in join query.");
    }

    // Para adicionar alias da tabela no apelido da projeção padrão
    protected createProjectionBuilder(): ProjectionBuilder<T>{
        return new ProjectionBuilder(this._typeT, this.alias, true)
    }
}
