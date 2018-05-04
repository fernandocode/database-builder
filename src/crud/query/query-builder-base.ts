import { QueryCompiled } from "./../../core/query-compiled";
import { ExecutableBuilder } from "./../../core/executable-builder";
import { ProjectionBuilder } from "./../projection-builder";
import { ExpressionOrColumn, Utils, ValueType } from "./../../core/utils";
import { DatabaseBase, DatabaseResult } from "./../../definitions/database-definition";
import { WhereBuilder } from "../where-builder";
import { OrderBy } from "../../core/enums/order-by";
import { WhereCompiled } from "../where-compiled";
import { SqlAndParams } from "../sql-and-params";
import { ProjectionCompiled } from "../projection-compiled";
import { LambdaExpression } from "lambda-expression";
import { DatabaseBuilderError } from "../../core/errors";
import { JoinQueryBuilderContract } from "./join-query-builder-contract";
import { QueryBuilderBaseContract } from "./query-builder-base-contract";
import { HavingBuilder } from "../having-builder";
import { ProjectionsHelper } from "../../core/projections-helper";
import { BuilderCompiled } from "../../core/builder-compiled";
import { ColumnRef } from "../../core/column-ref";
import { QueryCompilable } from "../../core/query-compilable";

let NEXT_VALUE_ALIAS: number = 0;

export abstract class QueryBuilderBase<T, TQuery extends QueryBuilderBase<T, TQuery>>
    implements QueryBuilderBaseContract<T, QueryBuilderBase<T, TQuery>> {

    protected _limit: BuilderCompiled = new BuilderCompiled();
    // protected _offset: BuilderCompiled = new BuilderCompiled();
    protected _orderBy: string = "";
    protected _groupBy: string = "";
    protected _having: WhereCompiled = {
        where: "",
        params: []
    } as WhereCompiled;

    protected _whereCompiled: WhereCompiled = {
        where: "",
        params: []
    } as WhereCompiled;

    protected _projectionCompiled: ProjectionCompiled = {
        projection: "",
        params: []
    } as ProjectionCompiled;

    private readonly _executableBuilder: ExecutableBuilder;

    private readonly WHERE = " WHERE ";
    private readonly GROUP_BY = " GROUP BY ";
    private readonly HAVING = " HAVING ";
    private readonly ORDER_BY = " ORDER BY ";
    private readonly LIMIT = " LIMIT";

    private _joinsQuery: Array<JoinQueryBuilderContract<any, any>> = [];
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
            throw new DatabaseBuilderError(`Alias: ${alias} já está sendo utilizado nesse contexto de query
            (query: ${this.compile().query}).`);
        }
        this._alias = alias;
        this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public get alias(): string {
        return this._alias;
    }

    public clone(): TQuery {
        return Object.assign({ __proto__: (this._getInstance() as any).__proto__ }, this._getInstance());
    }

    public ref(expression: ExpressionOrColumn<T>): ColumnRef {
        return new ColumnRef(
            Utils.getColumn(expression),
            this.alias
        );
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

    public from(query: QueryCompiled | QueryCompilable): TQuery {
        if ((query as QueryCompilable).compile) {
            return this.from((query as QueryCompilable).compile());
        }
        this._tablename = `(${(query as QueryCompiled).query})`;
        this._fromParams = (query as QueryCompiled).params;
        return this._getInstance();
    }

    public union(query: QueryCompiled | QueryCompilable): TQuery {
        if ((query as QueryCompilable).compile) {
            return this.union((query as QueryCompilable).compile());
        }
        this._unionsQuery.push(query as QueryCompiled);
        return this._getInstance();
    }

    public createWhere(): WhereBuilder<T> {
        return new WhereBuilder(this._typeT, this.alias);
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): TQuery {
        const instanceWhere: WhereBuilder<T> = this.createWhere();
        whereCallback(instanceWhere);
        this.compileWhere(instanceWhere.compile());
        return this._getInstance();
    }

    /**
     * Where with expression Lambda
     * #Experimental
     * @param {LambdaExpression<T>} expression
     * @returns {TQuery}
     * @memberof QueryBuilderBase
     */
    public whereExp(expression: LambdaExpression<T>): TQuery {
        const instanceWhere: WhereBuilder<T> = this.createWhere();
        instanceWhere.expression(expression);
        this.compileWhere(instanceWhere.compile());
        return this._getInstance();
    }

    public projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): TQuery {
        const instanceProjection: ProjectionBuilder<T> = this.createProjectionBuilder();
        projectionCallback(instanceProjection);
        this.compileProjection(instanceProjection.compile());
        return this._getInstance();
        // return this.select(projectionCallback);
    }

    public select(...expressions: Array<ExpressionOrColumn<T>>): TQuery {
        return this.projection(projection => projection.columns(...expressions));
        // const instanceProjection: ProjectionBuilder<T> = this.createProjectionBuilder();
        // instanceProjection.columns(...expressions);
        // this.compileProjection(instanceProjection.compile());
        // return this._getInstance();
    }

    public orderBy(expression: ExpressionOrColumn<T>, order: OrderBy = OrderBy.ASC): TQuery {
        this.compileOrderBy(`${Utils.addAlias(Utils.getColumn(expression), this._alias)} ${order}`);
        return this._getInstance();
    }

    public asc(expression: ExpressionOrColumn<T>): TQuery {
        return this.orderBy(expression, OrderBy.ASC);
    }

    public desc(expression: ExpressionOrColumn<T>): TQuery {
        return this.orderBy(expression, OrderBy.DESC);
    }

    public groupBy(
        expression: ExpressionOrColumn<T>,
        havingCallback?: (having: HavingBuilder<T>, projection: ProjectionsHelper<T>) => void
    ): TQuery {
        this.compileGroupBy(Utils.addAlias(Utils.getColumn(expression), this._alias));
        if (havingCallback) {
            const whereHaving = new HavingBuilder(this._typeT, "");
            havingCallback(whereHaving, new ProjectionsHelper(this._typeT, this._alias, false));
            this.compileHaving(whereHaving.compile());
        }
        return this._getInstance();
    }

    public execute(database: DatabaseBase): Promise<DatabaseResult> {
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
        const buildHaving = () =>
            this._having.where.length > 0
                ? `${this.HAVING}${this._having.where}`
                : "";
        const buildOrderBy = () =>
            this._orderBy.length > 0
                ? `${this.ORDER_BY}${this._orderBy}`
                : "";
        const buildLimit = () =>
            this._limit.builder.length > 0
                ? `${this.LIMIT}${this._limit.builder}`
                : "";
        // const buildOffset = () =>
        //     this._offset.builder.length > 0
        //         ? `${this.OFFSET}${this._offset.builder}`
        //         : "";
        return this.buildUnions({
            params: sqlBase.params.concat(
                this._joinParams.concat(
                    this._whereCompiled.params.concat(
                        this._having.params.concat(
                            this._limit.params
                        )
                    )
                )
            ),
            // Template: https://sqlite.org/lang_select.html
            query: `${sqlBase.sql}${buildWhere()}${buildGroupBy()}${buildHaving()}${buildOrderBy()}${buildLimit()}`,
        });
    }

    protected createProjectionBuilder(): ProjectionBuilder<T> {
        return new ProjectionBuilder(this._typeT, this.alias);
    }

    protected addJoin<TJoin, TQueryJoin extends JoinQueryBuilderContract<TJoin, TQueryJoin>>(
        joinQuery: JoinQueryBuilderContract<TJoin, TQueryJoin>
    ) {
        this._joinsQuery.push(joinQuery);
        this.compileWhere(joinQuery._getWhere());
        this.compileProjection(joinQuery._getSelect());
        this.compileGroupBy(joinQuery._getGroupBy());
        this.compileHaving(joinQuery._getHaving());
        this.compileOrderBy(joinQuery._getOrderBy());
    }

    protected abstract _getInstance(): TQuery;

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

    // In Utils
    // private addAlias(column: string): string {
    //     return `${this._alias}.${column}`;
    // }

    private compileGroupBy(groupBy: string) {
        if (groupBy && groupBy.length) {
            this._groupBy += `${this._groupBy.length ? ", " : ""}${groupBy}`;
        }
    }

    private compileHaving(having: WhereCompiled) {
        if (having && having.where && having.where.length) {
            this._having.where += `${this._having.where.length ? " AND " : ""}${having.where}`;
            this._having.params = this._having.params.concat(having.params);
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

    private compileTableJoins<TJoin, TQueryJoin extends JoinQueryBuilderContract<TJoin, TQueryJoin>>(
        tablesBase: SqlAndParams,
        join: JoinQueryBuilderContract<TJoin, TQueryJoin>
    ): SqlAndParams {
        const onWhereCompiled = join._getOn();
        return {
            params: tablesBase.params.concat(onWhereCompiled.params),
            sql: `${tablesBase.sql} ${join._getTypeJoin()} JOIN ${join.compileTable()} ON (${onWhereCompiled.where})`,
        };
    }

    private defaultAlias(typeT: new () => T) {
        if (typeT.name.length > 3) {
            return typeT.name.substring(0, 3);
        }
        return typeT.name;
    }
}
