import { ProjectionCompiled } from "../projection-compiled";
import { UnionType } from "../../core/union-type";
import { ProjectionBuilder } from "../projection-builder";
import { ExpressionOrColumn, ParamType, Utils } from "../../core/utils";
import { WhereBuilder } from "../where-builder";
import { OrderBy } from "../../core/enums/order-by";
import { WhereCompiled } from "../where-compiled";
import { QueryCompiled } from "../../core/query-compiled";
import { LambdaExpression } from "lambda-expression";
import { JoinQueryBuilderContract } from "./join-query-builder-contract";
import { QueryBuilderBaseContract } from "./query-builder-base-contract";
import { HavingBuilder } from "../having-builder";
import { ProjectionsHelper } from "../../core/projections-helper";
import { BuilderCompiled } from "../../core/builder-compiled";
import { ColumnRef } from "../../core/column-ref";
import { MapperTable } from "../../mapper-table";
import { SqlCompilable } from "../sql-compilable";
import { SqlBaseBuilder } from "../sql-base-builder";

// let NEXT_VALUE_ALIAS: number = 0;

export abstract class QueryBuilderBase<T,
    TQuery extends QueryBuilderBase<T, TQuery>>
    extends SqlBaseBuilder<T>
    implements QueryBuilderBaseContract<T, QueryBuilderBase<T, TQuery>> {

    protected _groupBy: string = "";
    protected _limit: BuilderCompiled = new BuilderCompiled();
    protected _orderBy: string = "";
    protected _having: WhereCompiled = {
        where: "",
        params: []
    } as WhereCompiled;

    // protected _whereCompiled: WhereCompiled = {
    //     where: "",
    //     params: []
    // } as WhereCompiled;

    protected _projectionCompiled: ProjectionCompiled = {
        projection: "",
        params: []
    } as ProjectionCompiled;

    // private readonly _executableBuilder: ExecutableBuilder;

    // private readonly WHERE = " WHERE ";
    private readonly GROUP_BY = " GROUP BY ";
    private readonly HAVING = " HAVING ";
    private readonly ORDER_BY = " ORDER BY ";
    private readonly LIMIT = " LIMIT";
    private readonly OFFSET = "OFFSET";

    private _joinsQuery: Array<JoinQueryBuilderContract<any, any>> = [];
    // TODO: remove "_joinParams" e utilizar SqlAndParams como é realizado nos projections
    private _joinParams: ParamType[] = [];

    private _unionsQuery: Array<{ query: QueryCompiled, type: UnionType }> = [];
    private _fromParams: ParamType[] = [];

    // private _tablename: string;
    // private readonly _alias: string;

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        alias: string = void 0,
        // enableLog: boolean = true
    ) {
        super(typeT, mapperTable, alias);
        // this._tablename = _typeT ? _typeT.name : mapperTable.tableName;
        // this._tablename = _typeT.name;
        // if (!alias) {
        //     alias = this.createUniqueAlias(this.defaultAlias(_typeT));
        // }
        // if (this.hasAlias(alias)) {
        //     throw new DatabaseBuilderError(`Mapper '${this._typeT.name}', alias: ${alias} já está sendo utilizado nesse contexto de query (query: ${this.compile().query}).`);
        // }
        // this._alias = alias;
        // this._executableBuilder = new ExecutableBuilder(enableLog);
    }

    public get alias(): string {
        return this._alias;
    }

    public clone(): TQuery {
        return Object.assign({ __proto__: (this._getInstance() as any).__proto__ }, this._getInstance());
    }

    public ref<TReturn>(expression: ExpressionOrColumn<TReturn, T>, alias: string = this.alias): ColumnRef {
        return new ColumnRef(
            Utils.getColumn(expression),
            alias
        );
    }

    public hasAlias(alias: string): boolean {
        if (super.hasAlias(alias)) {
            return true;
        }
        // if (this._alias === alias) {
        //     return true;
        // }
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

    public from(
        query: QueryCompiled[] | SqlCompilable
    ): TQuery {
        if ((query as SqlCompilable).compile) {
            return this.from((query as SqlCompilable).compile());
        }
        (query as QueryCompiled[])
            .forEach(compiled => {
                this._tablename = `(${compiled.query})`;
                this._fromParams = compiled.params;
            });
        // this._tablename = `(${(query as QueryCompiled).query})`;
        // this._fromParams = (query as QueryCompiled).params;
        return this._getInstance();
    }

    public unionAll(
        query: QueryCompiled[] | SqlCompilable
    ): TQuery {
        return this.union(query, UnionType.All);
    }

    public union(
        query: QueryCompiled[] | SqlCompilable,
        type: UnionType = UnionType.None
    ): TQuery {
        if ((query as SqlCompilable).compile) {
            return this.union((query as SqlCompilable).compile(), type);
        }
        (query as QueryCompiled[])
            .forEach(compiled => {
                this._unionsQuery.push({ query: compiled, type });
            });
        // this._unionsQuery.push({ query: query as QueryCompiled, type });
        return this._getInstance();
    }

    public createWhere(): WhereBuilder<T> {
        return new WhereBuilder(this._typeT, this.alias);
    }

    public where(
        whereCallback: (where: WhereBuilder<T>) => void
    ): TQuery {
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
    public whereExp(
        expression: LambdaExpression<T>
    ): TQuery {
        const instanceWhere: WhereBuilder<T> = this.createWhere();
        instanceWhere.expression(expression);
        this.compileWhere(instanceWhere.compile());
        return this._getInstance();
    }

    public projection(
        projectionCallback: (projection: ProjectionBuilder<T>) => void
    ): TQuery {
        const instanceProjection: ProjectionBuilder<T> = this.createProjectionBuilder();
        projectionCallback(instanceProjection);
        this.compileProjection(instanceProjection.compile());
        return this._getInstance();
    }

    public select(
        ...expressions: Array<ExpressionOrColumn<any, T>>
    ): TQuery {
        return this.projection(projection => projection.columns(...expressions));
    }

    public orderBy<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        order: OrderBy = OrderBy.ASC
    ): TQuery {
        this.compileOrderBy(`${Utils.addAlias(Utils.getColumn(expression), this._alias)} ${order}`);
        return this._getInstance();
    }

    public asc<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>
    ): TQuery {
        return this.orderBy(expression, OrderBy.ASC);
    }

    public desc<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>
    ): TQuery {
        return this.orderBy(expression, OrderBy.DESC);
    }

    public groupBy<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
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

    public limit(limit: number, offset?: number): TQuery {
        this._limit.builder = `${this.LIMIT} ?`;
        this._limit.params = [limit];
        if (offset) {
            this._limit.builder += ` ${this.OFFSET} ?`;
            this._limit.params.push(offset);
        }
        return this._getInstance();
    }

    // public execute(
    //     database: DatabaseBase
    // ): Promise<DatabaseResult[]> {
    //     return this._executableBuilder.execute([this.compile()], database);
    // }

    public compileTable(): string {
        return `${this._tablename} AS ${this._alias}`;
    }

    public compile(): QueryCompiled {
        const compiled: QueryCompiled = this.buildBase();
        // const buildWhere = () =>
        //     this.whereCompiled.where.length > 0
        //         ? `${this.WHERE}${this.whereCompiled.where}`
        //         : "";
        // const buildGroupBy = () =>
        //     this._groupBy.length > 0
        //         ? `${this.GROUP_BY}${this._groupBy}`
        //         : "";
        // const buildHaving = () =>
        //     this._having.where.length > 0
        //         ? `${this.HAVING}${this._having.where}`
        //         : "";
        // const buildOrderBy = () =>
        //     this._orderBy.length > 0
        //         ? `${this.ORDER_BY}${this._orderBy}`
        //         : "";
        // const buildLimit = () =>
        //     this._limit.builder.length > 0
        //         ? `${this.LIMIT}${this._limit.builder}`
        //         : "";
        return this.buildUnions({
            params: compiled.params
                .concat(this._joinParams)
                .concat(this.whereCompiled.params)
                .concat(this._having.params)
                .concat(this._limit.params),
            query: `${compiled.query}${this.whereCompiled.where}${this._groupBy}${this._having.where}${this._orderBy}${this._limit.builder}`
            // params: sqlBase.params.concat(
            //     this._joinParams.concat(
            //         this.whereCompiled.params.concat(
            //             this._having.params.concat(
            //                 this._limit.params
            //             )
            //         )
            //     )
            // ),
            // // Template: https://sqlite.org/lang_select.html
            // query: `${sqlBase.query}${buildWhere()}${buildGroupBy()}${buildHaving()}${buildOrderBy()}${buildLimit()}`,
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

    protected setDefaultColumns(): void {
        this.projection((projection) => projection.all());
    }

    protected getColumnsCompiled(): ProjectionCompiled {
        if (!this._projectionCompiled.projection.length) {
            this.setDefaultColumns();
        }
        return this._projectionCompiled;
    }

    protected buildBase(): QueryCompiled {
        const columnsCompiled = this.getColumnsCompiled();
        // if (!this._projectionCompiled.projection.length) {
        //     this.projection((projection) => projection.all());
        // }

        let tablenameAndJoins: QueryCompiled = { query: this.compileTable(), params: this._fromParams };
        for (const key in this._joinsQuery) {
            if (this._joinsQuery.hasOwnProperty(key)) {
                const joinQuery = this._joinsQuery[key];
                tablenameAndJoins = this.compileTableJoins(tablenameAndJoins, joinQuery);
            }
        }

        this._joinParams = tablenameAndJoins.params;

        return {
            params: columnsCompiled.params,
            query: `SELECT ${columnsCompiled.projection} FROM ${tablenameAndJoins.query}`,
            // params: this._projectionCompiled.params,
            // query: `SELECT ${this._projectionCompiled.projection} FROM ${tablenameAndJoins.query}`,
        } as QueryCompiled;
    }

    protected compileGroupBy(groupBy: string, addCommand: boolean = true) {
        if (groupBy && groupBy.length) {
            this._groupBy += `${this._groupBy.length ? ", " : (addCommand ? this.GROUP_BY : "")}${groupBy}`;
        }
    }

    protected compileHaving(having: WhereCompiled, addCommand: boolean = true) {
        if (having && having.where && having.where.length) {
            this._having.where += `${this._having.where.length ? " AND " : (addCommand ? this.HAVING : "")}${having.where}`;
            this._having.params = this._having.params.concat(having.params);
        }
    }

    protected compileOrderBy(orderBy: string, addCommand: boolean = true) {
        if (orderBy && orderBy.length) {
            this._orderBy += `${this._orderBy.length ? ", " : (addCommand ? this.ORDER_BY : "")}${orderBy}`;
        }
    }

    protected abstract _getInstance(): TQuery;

    // private createUniqueAlias(aliasProposed: string): string {
    //     aliasProposed = aliasProposed ? aliasProposed.toLowerCase() : aliasProposed;
    //     if (this.hasAlias(aliasProposed)) {
    //         return this.createUniqueAlias(`${aliasProposed}${NEXT_VALUE_ALIAS++}`);
    //     }
    //     return aliasProposed;
    // }

    private buildUnions(queryBase: QueryCompiled): QueryCompiled {
        for (const key in this._unionsQuery) {
            if (this._unionsQuery.hasOwnProperty(key)) {
                const unionQuery = this._unionsQuery[key];
                queryBase.query += ` UNION${unionQuery.type === UnionType.All ? " ALL" : ""} ${unionQuery.query.query}`;
                queryBase.params = queryBase.params.concat(unionQuery.query.params);
            }
        }
        return queryBase;
    }

    // private compileWhere(compiled: WhereCompiled) {
    //     if (compiled.where.length) {
    //         this.whereCompiled.where +=
    //             `${(this.whereCompiled.where.length ? " AND " : "")}${compiled.where}`;
    //         compiled.params.forEach((value) => {
    //             this.whereCompiled.params.push(value);
    //         });
    //     }
    // }

    private compileProjection(compiled: ProjectionCompiled) {
        if (compiled.projection.length) {
            this._projectionCompiled.projection +=
                `${(this._projectionCompiled.projection.length ? ", " : "")}${compiled.projection}`;
            compiled.params.forEach((value: any) => {
                this._projectionCompiled.params.push(value);
            });
        }
    }

    private compileTableJoins<TJoin, TQueryJoin extends JoinQueryBuilderContract<TJoin, TQueryJoin>>(
        tablesBase: QueryCompiled,
        join: JoinQueryBuilderContract<TJoin, TQueryJoin>
    ): QueryCompiled {
        const onWhereCompiled = join._getOn();
        return {
            params: tablesBase.params.concat(onWhereCompiled.params),
            query: `${tablesBase.query} ${join._getTypeJoin()} JOIN ${join.compileTable()} ON (${onWhereCompiled.where})`,
        };
    }

    // private defaultAlias(typeT: new () => T) {
    //     if (typeT.name.length > 3) {
    //         return typeT.name.substring(0, 3);
    //     }
    //     return typeT.name;
    // }
}
