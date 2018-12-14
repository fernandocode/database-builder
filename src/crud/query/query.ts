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

export class Query<T> extends SqlBase<T> {

    private _queryBuilder: QueryBuilder<T>;
    private _queryReadableBuilder: QueryReadableBuilder<T>;

    constructor(
        typeT: new () => T,
        alias: string = void 0,
        private _getMapper: (tKey: (new () => any) | string) => MetadataTable<any>,
        mapperTable: MapperTable = _getMapper(typeT).mapperTable,
        database?: DatabaseBase,
        enableLog: boolean = true,
    ) {
        super(mapperTable, database, enableLog);
        this._queryBuilder = new QueryBuilder(typeT, mapperTable, alias, _getMapper);
        this._queryReadableBuilder = new QueryReadableBuilder(typeT, enableLog);
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
        typeTJoin: new () => TJoin,
        onWhere: (where: WhereBuilder<TJoin>) => void,
        join: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0
    ): Query<T> {
        this._queryBuilder.join(typeTJoin, onWhere, join, this._getMapper(typeTJoin).mapperTable, type, alias);
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
    ): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            this._queryReadableBuilder.executeAndRead(
                cascade,
                this,
                mapperTable,
                this.getDatabase(database))
                .then(result => {
                    this.fetchModels(cascade, result, mapperTable)
                        .then(result => {
                            resolve(result);
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    public toList(cascade: boolean = true): Promise<T[]> {
        return this.executeAndRead(cascade);
    }

    public toListParse<TParse>(metadataParse: MetadataTable<TParse>): Promise<TParse[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then((cursor) => {
                    resolve(this.read(cursor, metadataParse.newable, metadataParse.mapperTable));
                })
                .catch(reject);
        });
    }

    public toListTo<TReader>(newable: new () => TReader, mapperTable: MapperTable): Promise<TReader[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then((cursor) => {
                    resolve(this.read(cursor, newable, mapperTable));
                })
                .catch(reject);
        });
    }

    public toCast(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then((cursors) => {
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"toCast" is not ready to solve multiple queries in one batch!`);
                    }
                    resolve(this._queryReadableBuilder.toCast(cursors[0]));
                })
                .catch(reject);
        });
    }

    public map(mapper: (row: any) => any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then((cursors) => {
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"map" is not ready to solve multiple queries in one batch!`);
                    }
                    resolve(this._queryReadableBuilder.map(cursors[0], mapper));
                })
                .catch(reject);
        });
    }

    public mapper<T extends any>(mapper: (row: RowResult<T>) => T): Promise<T[]> {
        const mapperTable = this.getMapper(void 0, false);
        return new Promise((resolve, reject) => {
            this.execute()
                .then((cursors) => {
                    if (cursors.length !== 1) {
                        throw new DatabaseBuilderError(`"mapper" is not ready to solve multiple queries in one batch!`);
                    }
                    resolve(this._queryReadableBuilder.mapper(cursors[0], mapperTable, mapper, this._getMapper, this._queryBuilder));
                })
                .catch(reject);
        });
    }

    public firstOrDefault(cascade: boolean = true, _default?: any): Promise<T> {
        return new Promise((resolve, reject) => {
            this.limit(1)
                .toList(cascade)
                .then((result) => {
                    resolve((result && result.length) ? result[0] : _default);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public read<TReader>(cursor: any, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        return this._queryReadableBuilder.read(cursor, newable, mapperTable);
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

    protected checkDatabaseResult(promise: Promise<DatabaseResult[]>): Promise<DatabaseResult[]> {
        return promise;
    }

    private getMapper(mapperTable: MapperTable, throwNotFound: boolean = true): MapperTable {
        const result = (mapperTable ? mapperTable : this.mapperTable);
        if (!result && throwNotFound) {
            throw new DatabaseBuilderError("MapperTable not specified in query. Call 'executeAndRead'.");
        }
        return result;
    }

    private fetchModels(cascade: boolean = true, models: T[], mapperTable: MapperTable): Promise<T[]> {
        const promises: Array<Promise<T>> = [];
        models.forEach(model => {
            promises.push(this.fetchModel(cascade, model, mapperTable));
        });
        return Promise.all(promises);
    }

    private fetchModel(cascade: boolean = true, model: T, mapperTable: MapperTable): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const promises: Array<Promise<{ field: string, value: any }>> = [];
            mapperTable.dependencies.forEach(dependency => {
                if (cascade) {
                    const queryDependency = new Query<DependencyListSimpleModel>(void 0, void 0, this._getMapper, dependency, this.database, this.enableLog);
                    queryDependency.where(where => {
                        const columnReference = dependency.getColumnNameByField<DependencyListSimpleModel, any>(x => x.reference);
                        where.equal(new ColumnRef(columnReference), KeyUtils.getKey(mapperTable, model));
                    });
                    promises.push(new Promise<{ field: string, value: any }>((r, rej) => {
                        queryDependency.toList()
                            .then(result => {
                                const fieldDependency = mapperTable.columns.find(x => x.tableReference === dependency.tableName).fieldReference;
                                r({ field: fieldDependency, value: result.map(x => x.value) });
                            })
                            .catch(err => {
                                reject(err);
                            });
                    }));
                } else {
                    promises.push(new Promise<{ field: string, value: any }>((r, rej) => {
                        const fieldDependency = mapperTable.columns.find(x => x.tableReference === dependency.tableName).fieldReference;
                        r({ field: fieldDependency, value: [] });
                    }));
                }
            });
            Promise.all(promises)
                .then(result => {
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
                    resolve(model);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
