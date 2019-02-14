import { RowResult } from "../../core/row-result";
import { HavingBuilder } from "../having-builder";
import { QueryReadableBuilder } from "./query-readable-builder";
import { QueryCompiled } from "../../core/query-compiled";
import { MapperTable } from "../../mapper-table";
import { ProjectionBuilder } from "../projection-builder";
import { WhereBuilder } from "../where-builder";
import { DatabaseBase, DatabaseResult } from "../../definitions/database-definition";
import { MetadataTable } from "../../metadata-table";
import { QueryBuilder } from "./query-builder";
import { ExpressionOrColumn, Utils } from "../../core/utils";
import { OrderBy } from "../../core/enums/order-by";
import { JoinType } from "../enums/join-type";
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
import { Observable, Observer } from "rxjs";
import { forkJoinSafe } from "../../safe-utils";

export class Query<T> extends SqlBase<T> {

    private _queryBuilder: QueryBuilder<T>;
    private _queryReadableBuilder: QueryReadableBuilder<T>;

    constructor(
        private _queryT: (new () => T) | QueryBuilder<T>,
        alias: string = void 0,
        private _getMapper: (tKey: (new () => any) | string) => MetadataTable<any>,
        mapperTable: MapperTable = Utils.getMapperTable(_queryT, _getMapper).mapperTable,
        database?: DatabaseBase,
        enableLog: boolean = true,
    ) {
        super(mapperTable, database, enableLog);
        this._queryBuilder = new QueryBuilder(_queryT, mapperTable, alias, _getMapper);
        this._queryReadableBuilder = new QueryReadableBuilder(Utils.getMapperTable(_queryT, _getMapper).newable, enableLog);
    }

    public compile(): QueryCompiled[] {
        const compiled = this.builderCompiled();
        const script = [compiled];
        return script;
    }

    /**
     * @link QueryBuilder
     */
    public alias(): string {
        return this._queryBuilder.alias;
    }

    public ref<TReturn>(expression: ExpressionOrColumn<TReturn, T>): ColumnRef {
        return this._queryBuilder.ref(expression);
    }

    public from(query: QueryCompiled[] | SqlCompilable): Query<T> {
        this._queryBuilder.from(query);
        return this;
    }

    public union(query: QueryCompiled[] | SqlCompilable): Query<T> {
        this._queryBuilder.union(query);
        return this;
    }

    public unionAll(query: QueryCompiled[] | SqlCompilable): Query<T> {
        this._queryBuilder.unionAll(query);
        return this;
    }

    public join<TJoin>(
        queryTJoin: (new () => TJoin) | QueryBuilder<TJoin> | { _builder: () => QueryBuilder<TJoin> },
        onWhere: (where: WhereBuilder<TJoin>) => void,
        join: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0
    ): Query<T> {
        if (queryTJoin && (queryTJoin as { _builder: () => QueryBuilder<TJoin> })._builder) {
            queryTJoin = (queryTJoin as { _builder: () => QueryBuilder<TJoin> })._builder();
        }
        this._queryBuilder.join(
            queryTJoin as (new () => TJoin) | QueryBuilder<TJoin>,
            onWhere, join, Utils.getMapperTable(queryTJoin, this._getMapper).mapperTable, type, alias);
        return this;
    }

    public createWhere(): WhereBuilder<T> {
        return this._queryBuilder.createWhere();
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Query<T> {
        this._queryBuilder.where(where);
        return this;
    }

    public whereExp(expression: LambdaExpression<T>): Query<T> {
        this._queryBuilder.whereExp(expression);
        return this;
    }

    /**
     * @param projectionCallback
     */
    public projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): Query<T> {
        this._queryBuilder.projection(projectionCallback);
        return this;
    }

    public select(...expressions: Array<ExpressionOrColumn<any, T>>): Query<T> {
        this._queryBuilder.select(...expressions);
        return this;
    }

    public limit(limit: number, offset?: number): Query<T> {
        this._queryBuilder.limit(limit, offset);
        return this;
    }

    public orderBy<TReturn>(expression: ExpressionOrColumn<TReturn, T>, order: OrderBy = OrderBy.ASC): Query<T> {
        this._queryBuilder.orderBy(expression, order);
        return this;
    }

    public asc<TReturn>(expression: ExpressionOrColumn<TReturn, T>): Query<T> {
        this._queryBuilder.asc(expression);
        return this;
    }

    public desc<TReturn>(expression: ExpressionOrColumn<TReturn, T>): Query<T> {
        this._queryBuilder.desc(expression);
        return this;
    }

    public groupBy<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        havingCallback?: (having: HavingBuilder<T>, projection: ProjectionsHelper<T>) => void
    ): Query<T> {
        this._queryBuilder.groupBy(expression, havingCallback);
        return this;
    }

    public toString() {
        return this.compile().map(x => x.query).join("\n");
    }

    /**
     * @link QueryReadableBuilder
     */

    public executeAndRead(
        cascade: boolean = true,
        mapperTable: MapperTable = this.getMapper(void 0),
        database: DatabaseBase = void 0,
    ): Observable<T[]> {
        return Observable.create((observer: Observer<T[]>) => {
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

    public toList(cascade?: boolean): Observable<T[]> {
        return this.executeAndRead(cascade);
    }

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

    public mapper<T extends any>(mapper: (row: RowResult<T>) => T): Observable<T[]> {
        return Observable.create((observer: Observer<T[]>) => {
            this.execute()
                .subscribe((cursors) => {
                    const mapperTable = this.getMapper(void 0, false);
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"mapper" is not ready to solve multiple queries in one batch!`);
                    }
                    observer.next(this._queryReadableBuilder.mapper(
                        cursors[0], mapperTable, mapper, this._getMapper, this._queryBuilder, Utils.getMapperTable(this._queryT, this._getMapper).newable
                    ));
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    public firstOrDefault(cascade?: boolean, _default?: any): Observable<T> {
        return Observable.create((observer: Observer<T[]>) => {
            this.limit(1)
                .toList(cascade)
                .subscribe((result) => {
                    observer.next((result && result.length) ? result[0] : _default);
                    observer.complete();
                }, (err) => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    public read<TReader>(cursor: any, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        return this._queryReadableBuilder.read(cursor, newable, mapperTable);
    }

    /**
     * @hidden
     */
    public _builder(): QueryBuilder<T> {
        return this._queryBuilder;
    }
    protected model(): T {
        return void 0;
    }

    protected builderCompiled(): QueryCompiled {
        return this._queryBuilder.compile();
    }

    protected resolveDependencyByValue(dependency: MapperTable, value: any, index: number): QueryCompiled {
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

    private fetchModels(cascade: boolean, models: T[], mapperTable: MapperTable): Observable<T[]> {
        const promises: Array<Observable<T>> = [];
        models.forEach(model => {
            promises.push(this.fetchModel(cascade, model, mapperTable));
        });
        return forkJoinSafe(promises);
    }

    private fetchModel(cascade: boolean, model: T, mapperTable: MapperTable): Observable<T> {
        return Observable.create((observer: Observer<T>) => {
            const promises: Array<Observable<{ field: string, value: any }>> = [];
            mapperTable.dependencies.forEach(dependency => {
                if (cascade) {
                    const queryDependency = new Query<DependencyListSimpleModel>(void 0, void 0, this._getMapper, dependency, this.database, this.enableLog);
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
}
