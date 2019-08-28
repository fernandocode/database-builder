import { ProjectionCompiled } from "../projection-compiled";
import { UnionType } from "../../core/union-type";
import { ProjectionBuilder } from "../projection-builder";
import { ExpressionOrColumn, ParamType, Utils, TypeOrderBy } from "../../core/utils";
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
import { MetadataTable } from "../../metadata-table";
import { MapperUtils } from "../../mapper/mapper-utils";
import { DatabaseBuilderError } from "../../core";
import { QueryBuilder } from "./query-builder";
import { ModelUtils } from "../../core/model-utils";
import { ParamFilter } from "../../core/param-filter";
import { PlanRef } from "../../core/plan-ref";
import { ProjectionModel } from "../projection-model";
import { ProjectionCompile } from "../projection-compile";
import { Replaceable } from "../../core/replaceable";
import { QueryHelper } from "../../core/query-helper";

export abstract class QueryBuilderBase<T,
    TQuery extends QueryBuilderBase<T, TQuery>>
    extends SqlBaseBuilder<T>
    implements QueryBuilderBaseContract<T, QueryBuilderBase<T, TQuery>> {

    public get alias(): string {
        return this._alias;
    }

    public get tablename(): string {
        return this._tablename;
    }

    protected _groupBy: string = "";
    protected _limit: BuilderCompiled = new BuilderCompiled();
    protected _orderBy: string = "";
    protected _having: WhereCompiled = {
        where: "",
        params: []
    } as WhereCompiled;

    protected _projections: ProjectionModel[] = [];
    // protected _projectionCompiled: ProjectionCompiled = {
    //     projection: "",
    //     params: []
    // } as ProjectionCompiled;
    // TODO: remove "_joinParams" e utilizar SqlAndParams como é realizado nos projections
    protected _joinParams: ParamType[] = [];
    protected _ignoreQueryFilter: boolean = false;

    private readonly GROUP_BY = " GROUP BY ";
    private readonly HAVING = " HAVING ";
    private readonly ORDER_BY = " ORDER BY ";
    private readonly LIMIT = " LIMIT";
    private readonly OFFSET = "OFFSET";

    private _paramsQueryFilter: { [s: string]: ParamType };
    private _joinsQuery: Array<JoinQueryBuilderContract<any, any>> = [];

    private _unionsQuery: Array<{ query: QueryCompiled, type: UnionType }> = [];
    private _fromParams: ParamType[] = [];

    constructor(
        queryT: (new () => T) | QueryBuilder<T>,
        mapperTable: MapperTable,
        alias: string = void 0,
        protected _getMapper?: (tKey: (new () => any) | string) => MetadataTable<any>
    ) {
        super(queryT, Utils.getMapperTable(queryT, _getMapper).newable, mapperTable, alias);
        if (Utils.isQueryBuilder(queryT)) {
            const compiled = (queryT as QueryBuilder<T>).compile();
            this._tablename = `(${compiled.query})`;
            this._joinParams = this._joinParams.concat(compiled.params);
        }
    }

    public getAlias(tKey: (new () => any) | string): string {
        const tablename = MapperUtils.resolveKey(tKey);
        const isThis = this.tablename === tablename;
        const resultSearch = this._joinsQuery.filter(x => x.tablename === tablename);
        if (isThis && resultSearch.length === 0) {
            return this.alias;
        }
        if (resultSearch.length === 1 && !isThis) {
            return resultSearch[0].alias;
        }
        if (resultSearch.length > 1 || isThis) {
            throw new DatabaseBuilderError(`It is not possible to find a single alias for table "${tablename}", as there are multiple queries for table "${tablename}". It is necessary use the specific alias.`);
        }
        return void 0;
    }

    public clone(): TQuery {
        return ModelUtils.cloneDeep(this._getInstance());
        // return ModelUtils.assignWith(Object.create(Object.getPrototypeOf(this._getInstance())), this._getInstance());
        // return Object.assign(Object.create(Object.getPrototypeOf(this._getInstance())), this._getInstance());
        // return Object.assign({ __proto__: (this._getInstance() as any).__proto__ }, this._getInstance());
        // return Object.assign({ __proto__: (this._getInstance() as any).__proto__ }, this._getInstance());
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
        return this._getInstance();
    }

    public createWhere(): WhereBuilder<T> {
        return new WhereBuilder(this._newable, this.alias);
    }

    public where(
        whereCallback: (where: WhereBuilder<T>) => void
    ): TQuery {
        const instanceWhere: WhereBuilder<T> = this.createWhere();
        whereCallback(instanceWhere);
        this.compileWhere(this.whereCompiled, instanceWhere.compile());
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
        this.compileWhere(this.whereCompiled, instanceWhere.compile());
        return this._getInstance();
    }

    public projection(
        projectionCallback: (projection: ProjectionBuilder<T>) => void
    ): TQuery {
        const instanceProjection: ProjectionBuilder<T> = this.createProjectionBuilder();
        projectionCallback(instanceProjection);
        this.buildProjections(instanceProjection.result());
        // this.compileProjection(instanceProjection.compile());
        return this._getInstance();
    }

    public select(
        ...expressions: Array<ExpressionOrColumn<any, T>>
    ): TQuery {
        return this.projection(projection => projection.columns(...expressions));
    }

    public orderBy<TReturn>(
        expression: TypeOrderBy<TReturn, T>,
        order: OrderBy = OrderBy.ASC
    ): TQuery {
        let columnName;
        if (Utils.isQueryCompiled(expression)) {
            return this.orderBy(`(${QueryHelper.compileWithoutParams(expression as QueryCompiled)})`, order);
        } else if (Utils.isQueryCompiledArray(expression)) {
            return this.orderBy((expression as QueryCompiled[])[0], order);
        } else if (Utils.isPlanRef(expression)) {
            columnName = (expression as PlanRef).result();
        } else if (Utils.isNumber(expression)) {
            columnName = `${(expression as number)}`;
        } else {
            columnName = Utils.addAlias(Utils.getColumn(expression as ExpressionOrColumn<TReturn, T>), this._alias);
        }
        this.compileOrderBy(`${columnName} ${order}`);
        return this._getInstance();
    }

    public asc<TReturn>(
        expression: TypeOrderBy<TReturn, T>
    ): TQuery {
        return this.orderBy(expression, OrderBy.ASC);
    }

    public desc<TReturn>(
        expression: TypeOrderBy<TReturn, T>
    ): TQuery {
        return this.orderBy(expression, OrderBy.DESC);
    }

    public groupBy<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        havingCallback?: (having: HavingBuilder<T>, projection: ProjectionsHelper<T>) => void
    ): TQuery {
        this.compileGroupBy(Utils.addAlias(Utils.getColumn(expression), this._alias));
        if (havingCallback) {
            const whereHaving = new HavingBuilder(this._newable, "");
            havingCallback(whereHaving, new ProjectionsHelper(this._newable, this._alias, false));
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

    /**
     * Find projection by alias and result index (base 1...N+1)
     * @param projectionAlias alias to find the projection
     * @returns index (base 1...N+1)
     */
    public getIndexProjection<TReturn>(projectionAlias: ExpressionOrColumn<TReturn, T>): number {
        const projectionColumnAlias = Utils.getColumn(projectionAlias);
        const index = this._projections.findIndex(x => x.projection.endsWith(` AS ${projectionColumnAlias}`));
        if (index > -1) {
            return index + 1;
        }
        throw new DatabaseBuilderError(`Not found projection alias ("${projectionColumnAlias}" in projections (current value: "${ProjectionCompile.compile(this._projections).projection}"))`);
    }

    public ignoreQueryFilters(): TQuery {
        if (this._joinsQuery.length) {
            throw new DatabaseBuilderError(`Can't apply 'ignoreQueryFilters' after joining 'join()'`);
        }
        this._ignoreQueryFilter = true;
        return this._getInstance();
    }

    public enableQueryFilters(): TQuery {
        if (this._joinsQuery.length) {
            throw new DatabaseBuilderError(`Can't apply 'addQueryFilters' after joining 'join()'`);
        }
        this._ignoreQueryFilter = false;
        return this._getInstance();
    }

    public setParamsQueryFilter(params: { [s: string]: ParamType }): TQuery {
        if (this._joinsQuery.length) {
            throw new DatabaseBuilderError(`Can't apply 'setParamsQueryFilter' after joining 'join()'`);
        }
        this._paramsQueryFilter = params;
        return this._getInstance();
    }

    public compileTable(): string {
        return `${this._tablename} AS ${this._alias}`;
    }

    public compile(): QueryCompiled {
        const whereCompiled: WhereCompiled = this.whereCompile(this.whereCompiled);

        const compiled: QueryCompiled = this.buildBase();
        return this.buildUnions({
            params: compiled.params
                .concat(this._joinParams)
                .concat(whereCompiled.params)
                .concat(this._having.params)
                .concat(this._limit.params),
            // Template: https://sqlite.org/lang_select.html
            query: `${compiled.query}${whereCompiled.where}${this._groupBy}${this._having.where}${this._orderBy}${this._limit.builder}`
        });
    }

    protected whereCompile(baseWhereCompiled: WhereCompiled): WhereCompiled {
        const whereCompiled: WhereCompiled = ModelUtils.cloneDeep(baseWhereCompiled);

        // apply query filter
        const queryFilter: WhereCompiled = ModelUtils.cloneDeep(this.mapperTable.queryFilter);
        if (!this._ignoreQueryFilter && queryFilter && queryFilter.where) {
            queryFilter.where = queryFilter.where.replace(new RegExp(Utils.REPLACEABLE_ALIAS, "g"), this.alias);
            if (queryFilter.params && this._paramsQueryFilter) {
                queryFilter.params = queryFilter.params.map(param => {
                    const keyParam = Object.keys(this._paramsQueryFilter)
                        .find(x => {
                            const result = ParamFilter.PATTERN.exec(param as string);
                            return result && result.length > 1
                                ? result[1] === x
                                : false;
                        });
                    return Utils.isString(param) && keyParam
                        ? Utils.isString(this._paramsQueryFilter[keyParam])
                            ? (param as string).replace(ParamFilter.PATTERN, this._paramsQueryFilter[keyParam] as string)
                            : this._paramsQueryFilter[keyParam]
                        : param;
                });
            }
            this.compileWhere(whereCompiled, queryFilter);
        }
        return whereCompiled;
    }

    protected createProjectionBuilder(
        addAliasTableToAlias?: boolean,
        addAliasDefault?: boolean
    ): ProjectionBuilder<T> {
        return new ProjectionBuilder(this._newable, this.alias, addAliasTableToAlias, addAliasDefault, this._getMapper);
    }

    protected addJoin<TJoin, TQueryJoin extends JoinQueryBuilderContract<TJoin, TQueryJoin>>(
        joinQuery: JoinQueryBuilderContract<TJoin, TQueryJoin>
    ) {
        // if (this._ignoreQueryFilter) {
        //     joinQuery.ignoreQueryFilters();
        // }
        // if (this._paramsQueryFilter) {
        //     joinQuery.setParamsQueryFilter(this._paramsQueryFilter);
        // }
        this._joinsQuery.push(joinQuery);
        this._joinParams = this._joinParams.concat(joinQuery._getParams());
        this.compileWhere(this.whereCompiled, joinQuery._getWhere());
        this.buildProjections(joinQuery._getProjections());
        // this.compileProjection(joinQuery._getSelect());
        this.compileGroupBy(joinQuery._getGroupBy());
        this.compileHaving(joinQuery._getHaving());
        this.compileOrderBy(joinQuery._getOrderBy());
    }

    protected setDefaultColumns(): void {
        this.projection((projection) => projection.all());
    }

    protected getColumnsCompiled(): ProjectionCompiled {
        if (this._projections.length === 0) {
            this.setDefaultColumns();
        }
        return ProjectionCompile.compile(this._projections);
        // if (!this._projectionCompiled.projection.length) {
        //     this.setDefaultColumns();
        // }
        // return this._projectionCompiled;
    }

    protected buildBase(): QueryCompiled {
        const columnsCompiled = this.getColumnsCompiled();

        let tablenameAndJoins: QueryCompiled = { query: this.compileTable(), params: this._fromParams };
        for (const key in this._joinsQuery) {
            if (this._joinsQuery.hasOwnProperty(key)) {
                const joinQuery = this._joinsQuery[key];
                tablenameAndJoins = this.compileTableJoins(tablenameAndJoins, joinQuery);
            }
        }

        this._joinParams = this._joinParams.concat(tablenameAndJoins.params);

        return {
            params: columnsCompiled.params,
            query: `SELECT ${columnsCompiled.projection} FROM ${tablenameAndJoins.query}`,
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

    private buildProjections(projections: ProjectionModel[]) {
        if (projections.length > 0) {
            this._projections = [...this._projections, ...projections];
        }
    }
    // private compileProjection(compiled: ProjectionCompiled) {
    //     if (compiled.projection.length) {
    //         this._projectionCompiled.projection +=
    //             `${(this._projectionCompiled.projection.length ? ", " : "")}${compiled.projection}`;
    //         compiled.params.forEach((value: any) => {
    //             this._projectionCompiled.params.push(value);
    //         });
    //     }
    // }

    private compileTableJoins<TJoin, TQueryJoin extends JoinQueryBuilderContract<TJoin, TQueryJoin>>(
        tablesBase: QueryCompiled,
        join: JoinQueryBuilderContract<TJoin, TQueryJoin>
    ): QueryCompiled {
        const onWhereCompiled = join._getOn();
        return {
            params: tablesBase.params.concat(onWhereCompiled.params),
            // params: join._getParams().concat(tablesBase.params.concat(onWhereCompiled.params)),
            query: `${tablesBase.query} ${join._getTypeJoin()} JOIN ${join.compileTable()} ON (${onWhereCompiled.where})`,
        };
    }
}
