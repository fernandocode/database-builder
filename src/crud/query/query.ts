import { JoinType } from "../enums/join-type";
import { RowResult } from "../../core/row-result";
import { QueryReadableBuilder } from "./query-readable-builder";
import { QueryCompiled } from "../../core/query-compiled";
import { MapperTable } from "../../mapper-table";
import { ProjectionBuilder } from "../projection-builder";
import { WhereBuilder } from "../where-builder";
import { DatabaseBase, DatabaseResult } from "../../definitions/database-definition";
import { MetadataTable } from "../../metadata-table";
import { QueryBuilder } from "./query-builder";
import { ExpressionOrColumn, ParamType, TypeOrderBy, Utils, ValueTypeToParse } from "../../core/utils";
import { OrderBy } from "../../core/enums/order-by";
import { HavingBuilder } from "../having-builder";
import { LambdaExpression } from "lambda-expression";
import { JoinQueryBuilder } from "./join-query-builder";
import { DatabaseBuilderError } from "../../core/errors";
import { ProjectionsHelper } from "../../core/projections-helper";
import { ColumnRef } from "../../core/column-ref";
import { SqlCompilable } from "../sql-compilable";
import { SqlBase } from "../sql-base";
import { ModelUtils } from "../../core/model-utils";
import { DependencyListSimpleModel } from "../../definitions/dependency-definition";
import { KeyUtils } from "../../core/key-utils";
import { map, Observable, Observer } from "rxjs";
import { forkJoinSafe } from "../../safe-utils";
import { ProjectionsUtils } from "../../core/projections-utils";

export class Query<TType> extends SqlBase<TType> {

    private _queryBuilder: QueryBuilder<TType>;
    private _queryReadableBuilder: QueryReadableBuilder<TType>;
    private _getMapper: (tKey: (new () => any) | string) => MetadataTable<any>;

    constructor(
        private _queryT: (new () => TType) | QueryBuilder<TType>,
        {
            alias = void 0,
            getMapper,
            mapperTable,
            database = void 0,
            enableLog = true
        }: {
            alias?: string,
            getMapper?: (tKey: (new () => any) | string) => MetadataTable<any>,
            mapperTable?: MapperTable,
            database?: DatabaseBase,
            enableLog?: boolean
        } = {}
    ) {
        super({ mapperTable, database, enableLog });
        this._getMapper = getMapper;
        this._queryBuilder = new QueryBuilder(_queryT, mapperTable, alias, getMapper);
        this._queryReadableBuilder = new QueryReadableBuilder(Utils.getMapperTable(_queryT, getMapper).newable, enableLog);
    }

    public clone(): Query<TType> {
        return ModelUtils.cloneDeep(this);
    }

    public compile(): QueryCompiled[] {
        const compiled = this.builderCompiled();
        const script = [compiled];
        return script;
    }

    public ignoreQueryFilters(): Query<TType> {
        this._queryBuilder.ignoreQueryFilters();
        return this;
    }

    public setParamsQueryFilter(params: { [s: string]: ParamType }): Query<TType> {
        this._queryBuilder.setParamsQueryFilter(params);
        return this;
    }

    /**
     * @link QueryBuilder
     */
    public alias(): string {
        return this._queryBuilder.alias;
    }

    public ref<TReturn>(expression: ExpressionOrColumn<TReturn, TType>): ColumnRef {
        return this._queryBuilder.ref(expression);
    }

    public from(query: QueryCompiled[] | SqlCompilable): Query<TType> {
        this._queryBuilder.from(query);
        return this;
    }

    public union(query: QueryCompiled[] | SqlCompilable): Query<TType> {
        this._queryBuilder.union(query);
        return this;
    }

    public unionAll(query: QueryCompiled[] | SqlCompilable): Query<TType> {
        this._queryBuilder.unionAll(query);
        return this;
    }

    public join<TJoin>(
        queryTJoin: (new () => TJoin) | QueryBuilder<TJoin> | { _builder: () => QueryBuilder<TJoin> },
        onWhere: (where: WhereBuilder<TJoin>) => void,
        join: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0,
        ignoreQueryFilters?: boolean
    ): Query<TType> {
        if (queryTJoin && (queryTJoin as { _builder: () => QueryBuilder<TJoin> })._builder) {
            queryTJoin = (queryTJoin as { _builder: () => QueryBuilder<TJoin> })._builder();
        }
        this._queryBuilder.join(
            queryTJoin as (new () => TJoin) | QueryBuilder<TJoin>,
            onWhere, join, Utils.getMapperTable(queryTJoin, this._getMapper).mapperTable,
            type, alias, ignoreQueryFilters
        );
        return this;
    }

    public createWhere(): WhereBuilder<TType> {
        return this._queryBuilder.createWhere();
    }

    public where(where: (whereCallback: WhereBuilder<TType>) => void): Query<TType> {
        this._queryBuilder.where(where);
        return this;
    }

    public whereExp(expression: LambdaExpression<TType>): Query<TType> {
        this._queryBuilder.whereExp(expression);
        return this;
    }

    /**
     * @param projectionCallback
     */
    public projection(projectionCallback: (projection: ProjectionBuilder<TType>) => void): Query<TType> {
        this._queryBuilder.projection(projectionCallback);
        return this;
    }

    public select(...expressions: Array<ExpressionOrColumn<any, TType>>): Query<TType> {
        this._queryBuilder.select(...expressions);
        return this;
    }

    public limit(limit: number, offset?: number): Query<TType> {
        this._queryBuilder.limit(limit, offset);
        return this;
    }

    public orderBy<TReturn>(expression: ExpressionOrColumn<TReturn, TType>, order: OrderBy = OrderBy.ASC): Query<TType> {
        this._queryBuilder.orderBy(expression, order);
        return this;
    }

    public asc<TReturn>(expression: TypeOrderBy<TReturn, TType>): Query<TType> {
        this._queryBuilder.asc(expression);
        return this;
    }

    public desc<TReturn>(expression: TypeOrderBy<TReturn, TType>): Query<TType> {
        this._queryBuilder.desc(expression);
        return this;
    }

    public groupBy<TReturn>(
        expression: ExpressionOrColumn<TReturn, TType>,
        havingCallback?: (having: HavingBuilder<TType>, projection: ProjectionsHelper<TType>) => void
    ): Query<TType> {
        this._queryBuilder.groupBy(expression, havingCallback);
        return this;
    }

    /**
     * Find projection by alias and result index (base 1...N+1)
     * @param projectionAlias alias to find the projection
     * @returns index (base 1...N+1)
     */
    public getIndexProjection<TReturn>(projectionAlias: ExpressionOrColumn<TReturn, TType>): number {
        return this._queryBuilder.getIndexProjection(projectionAlias);
    }

    public toString() {
        return this.compile().map(x => x.query).join("\n");
    }

    /**
     * @link QueryReadableBuilder
     * @param cascade use cascade fetch in `hasMany` mapper (default = true)
     * @param mapper mapper table metadata
     * @param database database to execute query
     * @returns Array of `TType`
     */
    public executeAndRead(
        {
            cascade = true,
            database,
            mapperTable = this.getMapper(void 0)
        }: {
            cascade?: boolean,
            database?: DatabaseBase,
            mapperTable?: MapperTable
        } = {}
    ): Observable<TType[]> {
        return Observable.create((observer: Observer<TType[]>) => {
            this._queryReadableBuilder.executeAndRead(
                cascade,
                this,
                mapperTable,
                this.getDatabase(database))
                .subscribe(result => {
                    this.fetchModels(cascade, result, mapperTable)
                        .subscribe(result => {
                            observer.next(result);
                            observer.complete();
                        }, err => {
                            observer.error(err);
                            observer.complete();
                        });
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * Execute query and parse to @type {TType}
     * @param cascade use cascade fetch in `hasMany` mapper (default = true)
     * @returns Array of @type {TType}
     */
    public toList(
        {
            cascade = true,
            database
        }: {
            cascade?: boolean,
            database?: DatabaseBase
        } = {}
    ): Observable<TType[]> {
        return this.executeAndRead({ cascade, database });
    }

    /**
     * Execute query and parse to @type {TPrimitiveType}
     * @param cascade use cascade fetch in `hasMany` mapper (default = true)
     * @returns first or default @type {TPrimitiveType}
     */
    public toSingle<TPrimitiveType extends string | number | boolean>(
        {
            cascade = true,
            database,
            where,
            _default
        }: {
            cascade?: boolean,
            database?: DatabaseBase,
            where?: (whereCallback: WhereBuilder<TType>) => void,
            _default?: any
        } = {}
    ): Observable<TPrimitiveType> {
        if (where) {
            this.where(where);
        }
        return this.limit(1)
            .toSingleList<TPrimitiveType>({ cascade, database })
            .pipe(
                map(result => (result && result.length) ? result[0] : _default)
            );
    }

    /**
     * Execute query and parse to @type {TPrimitiveType}
     * @param cascade use cascade fetch in `hasMany` mapper (default = true)
     * @returns Array of @type {TPrimitiveType}
     */
    public toSingleList<TPrimitiveType extends string | number | boolean>(
        {
            cascade = true,
            database
        }: {
            cascade?: boolean,
            database?: DatabaseBase
        } = {}
    ): Observable<TPrimitiveType[]> {
        return this.mapper<TPrimitiveType>(r => r.single<TPrimitiveType>(), { cascade, database });
    }

    /**
     * Allow each parse items cursor
     * @param mapper callback mapper item
     * @param cascade use cascade fetch in `hasMany` mapper (default = true)
     * @returns Array of @type {T}
     */
    public mapper<T extends any>(
        mapper: (row: RowResult<T>) => T,
        {
            cascade = true,
            database
        }: {
            cascade?: boolean,
            database?: DatabaseBase
        } = {}
    ): Observable<T[]> {
        return new Observable<T[]>((observer) => {
            this.execute({ cascade, database })
                .subscribe((cursors) => {
                    const mapperTable = this.getMapper(void 0, false);
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"mapper" is not ready to solve multiple queries in one batch!`);
                    }
                    const resultMain = this._queryReadableBuilder.mapper(
                        cursors[0], mapperTable, mapper, this._getMapper, this._queryBuilder, Utils.getMapperTable(this._queryT, this._getMapper).newable
                    );
                    this.fetchModels(cascade, resultMain, mapperTable)
                        .subscribe(result => {
                            observer.next(result);
                            observer.complete();
                        }, err => {
                            observer.error(err);
                            observer.complete();
                        });
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * Get count rows (count by key column) by query
     * @param where where for apply in query
     * @returns count items
     */
    public count(
        {
            cascade = true,
            database,
            where
        }: {
            cascade?: boolean,
            database?: DatabaseBase,
            where?: (whereCallback: WhereBuilder<TType>) => void
        } = {}
    ): Observable<number> {
        return new Observable<number>(observer => {
            let keyColumn = ProjectionsUtils.WILDCARD;
            if (this.mapperTable && this.mapperTable.keyColumns().length > 0) {
                keyColumn = this.mapperTable.keyColumns()[0].column;
            }
            if (where) {
                this.where(where);
            }
            this
                .projection(p => p.clean().count(keyColumn, "count_id"))
                .mapper<number>(r => r.get<number>("count_id"), { cascade, database })
                .subscribe(
                    result => {
                        observer.next(result[0]);
                        observer.complete();
                    },
                    err => {
                        observer.error(err);
                        observer.complete();
                    }
                );
        });
    }

    /**
     * Get first or default item by query
     * @param where where for apply in query
     * @param cascade use cascade fetch in `hasMany` mapper (default = true)
     * @param _default default value if not found any item
     * @returns first or default item by query
     */
    public firstOrDefault(
        {
            cascade = true,
            database,
            where,
            _default
        }: {
            cascade?: boolean,
            database?: DatabaseBase,
            where?: (whereCallback: WhereBuilder<TType>) => void,
            _default?: any
        } = {}
    ): Observable<TType> {
        return Observable.create((observer: Observer<TType[]>) => {
            if (where) {
                this.where(where);
            }
            this.limit(1)
                .toList({ cascade, database })
                .subscribe((result) => {
                    observer.next((result && result.length) ? result[0] : _default);
                    observer.complete();
                }, (err) => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * @deprecated use `.mapper`
     * Supported up to version 1.0.0
     */
    public read<TReader>(cursor: any, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        return this._queryReadableBuilder.read(cursor, newable, mapperTable);
    }

    /**
     * @deprecated use `.mapper`
     * Supported up to version 1.0.0
     */
    public toListParse<TParse>(metadataParse: MetadataTable<TParse>): Observable<TParse[]> {
        return Observable.create((observer: Observer<TParse[]>) => {
            this.execute()
                .subscribe((cursor) => {
                    observer.next(this.read(cursor, metadataParse.newable, metadataParse.mapperTable));
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * @deprecated use `.mapper`
     * Supported up to version 1.0.0
     */
    public toListTo<TReader>(newable: new () => TReader, mapperTable: MapperTable): Observable<TReader[]> {
        return Observable.create((observer: Observer<TReader[]>) => {
            this.execute()
                .subscribe((cursor) => {
                    observer.next(this.read(cursor, newable, mapperTable));
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * @deprecated use `.mapper`
     * Supported up to version 1.0.0
     */
    public toCast(): Observable<any[]> {
        return Observable.create((observer: Observer<any[]>) => {
            this.execute()
                .subscribe(cursors => {
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"toCast" is not ready to solve multiple queries in one batch!`);
                    }
                    observer.next(this._queryReadableBuilder.toCast(cursors[0]));
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * @deprecated use `.mapper`
     * Supported up to version 1.0.0
     */
    public map(mapper: (row: any) => any): Observable<any[]> {
        return Observable.create((observer: Observer<any[]>) => {
            this.execute()
                .subscribe((cursors) => {
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"map" is not ready to solve multiple queries in one batch!`);
                    }
                    observer.next(this._queryReadableBuilder.map(cursors[0], mapper));
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    /**
     * @hidden
     */
    public _builder(): QueryBuilder<TType> {
        return this._queryBuilder;
    }
    protected model(): TType {
        return void 0;
    }

    protected builderCompiled(): QueryCompiled {
        return this._queryBuilder.compile();
    }

    protected resolveDependencyByValue(dependency: MapperTable, value: ValueTypeToParse, index: number): QueryCompiled {
        const insert = new QueryBuilder(void 0, dependency, void 0);
        return insert.compile();
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        return void 0;
    }

    protected checkDatabaseResult(promise: Observable<DatabaseResult[]>): Observable<DatabaseResult[]> {
        return promise;
    }

    private getMapper(mapperTable: MapperTable, throwNotFound: boolean = true): MapperTable {
        const result = (mapperTable ? mapperTable : this.mapperTable);
        if (!result && throwNotFound) {
            throw new DatabaseBuilderError("MapperTable not specified in query. Call 'executeAndRead'.");
        }
        return result;
    }

    private fetchModels<T>(cascade: boolean, models: T[], mapperTable: MapperTable): Observable<T[]> {
        const promises: Array<Observable<T>> = [];
        models.forEach(model => {
            promises.push(this.fetchModel(cascade, model, mapperTable));
        });
        return forkJoinSafe(promises);
    }

    private fetchModel<T>(cascade: boolean, model: T, mapperTable: MapperTable): Observable<T> {
        return new Observable<T>((observer) => {
            const promises: Array<Observable<{ field: string, value: any }>> = [];
            mapperTable.dependencies.forEach(dependency => {
                if (cascade) {
                    const queryDependency = new Query<DependencyListSimpleModel>(void 0, {
                        getMapper: this._getMapper,
                        mapperTable: dependency,
                        database: this.database,
                        enableLog: this.enableLog
                    });
                    queryDependency.where(where => {
                        const columnReference = dependency.getColumnNameByField<DependencyListSimpleModel, any>(x => x.reference);
                        where.equal(new ColumnRef(columnReference), KeyUtils.getKey(mapperTable, model));
                    });
                    promises.push(Observable.create((observerInner: Observer<{ field: string, value: any }>) => {
                        queryDependency.toList()
                            .subscribe(result => {
                                const fieldDependency = mapperTable.columns.find(x => x.tableReference === dependency.tableName).fieldReference;
                                observerInner.next({ field: fieldDependency, value: result.map(x => x.value) });
                                observerInner.complete();
                            }, err => {
                                observerInner.error(err);
                                observerInner.complete();
                            });
                    }));
                } else {
                    promises.push(Observable.create((observerInner: Observer<{ field: string, value: any }>) => {
                        const fieldDependency = mapperTable.columns.find(x => x.tableReference === dependency.tableName).fieldReference;
                        observerInner.next({ field: fieldDependency, value: [] });
                        observerInner.complete();
                    }));
                }
            });
            forkJoinSafe(promises)
                .subscribe(result => {
                    result.forEach(r => {
                        const fieldArraySplit = r.field.split("[?].");
                        if (fieldArraySplit.length === 1) {
                            ModelUtils.set(model, fieldArraySplit[0], r.value);
                        } else {
                            const values = (r.value as any[]).map(value => {
                                const item = {};
                                ModelUtils.set(item, fieldArraySplit[1], value);
                                return item;
                            });
                            ModelUtils.set(model, fieldArraySplit[0], values);
                        }
                    });
                    observer.next(model);
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    protected dependencies(): MapperTable[] {
        return this.mapperTable.dependencies;
    }
}
