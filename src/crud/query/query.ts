import { MapperTable } from './../../mapper-table';
import { ProjectionBuilder } from './../projection-builder';
import { WhereBuilder } from './../where-builder';
import { Database } from './../../definitions/database-definition';
import { MetadataTable } from './../../metadata-table';
import { QueryReadableBuilder } from './query-readable-builder';
import { QueryBuilder, JoinQueryBuilder, JoinType } from './query-builder';
import { ValueType, ResultExecuteSql, IQueryCompilable, OrderBy, QueryCompiled } from "./../../core/utils";
import { Expression } from "lambda-expression";

export class Query<T> implements IQueryCompilable {

    private _queryBuilder: QueryBuilder<T>;
    private _queryReadableBuilder: QueryReadableBuilder<T>;

    constructor(
        typeT: new () => T,
        alias: string = void 0,
        private _metadata: MetadataTable<T> = void 0,
        private _database: Database = void 0,
        enableLog: boolean = true
    ) {
        this._queryBuilder = new QueryBuilder(typeT, alias, enableLog);
        this._queryReadableBuilder = new QueryReadableBuilder(typeT, enableLog);
    }

    /**
     * @link QueryBuilder
     */

    public alias(): string {
        return this._queryBuilder.alias;
    }

    public ref(expression: Expression<T>): string {
        return this._queryBuilder.ref(expression);
    }

    public from(query: QueryCompiled): Query<T> {
        this._queryBuilder.from(query);
        return this;
    }

    public join<TJoin>(typeTJoin: new () => TJoin,
        onWhere: (where: WhereBuilder<TJoin>) => void,
        join: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0): Query<T> {
        this._queryBuilder.join(typeTJoin, onWhere, join, type, alias);
        return this;
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Query<T> {
        this._queryBuilder.where(where);
        return this;
    }

    public projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): Query<T> {
        this._queryBuilder.projection(projectionCallback);
        return this;
    }

    public limit(limit: number): Query<T> {
        this._queryBuilder.limit(limit);
        return this;
    }

    public orderBy(expression: Expression<T>, order: OrderBy = OrderBy.ASC): Query<T> {
        this._queryBuilder.orderBy(expression, order);
        return this;
    }

    public asc(expression: Expression<T>): Query<T> {
        this._queryBuilder.asc(expression);
        return this;
    }

    public desc(expression: Expression<T>): Query<T> {
        this._queryBuilder.desc(expression);
        return this;
    }

    public groupBy(expression: Expression<T>): Query<T> {
        this._queryBuilder.groupBy(expression);
        return this;
    }

    public execute(database: Database = void 0): Promise<ResultExecuteSql> {
        return this._queryBuilder.execute(this.getDatabase(database));
    }

    public compile(): { query: string, params: ValueType[] } {
        return this._queryBuilder.compile();
    }

    public toString() {
        return this.compile().query;
    }

    /**
     * @link QueryReadableBuilder
     */

    public executeAndRead(
        metadata: MetadataTable<T> = void 0,
        database: Database = void 0
    ): Promise<T[]> {
        return this._queryReadableBuilder.executeAndRead(
            this._queryBuilder,
            this.getMetadata(metadata),
            this.getDatabase(database));
    }

    public toList(): Promise<T[]> {
        return this.executeAndRead();
    }

    public toListParse<TParse>(metadataParse: MetadataTable<TParse>): Promise<TParse[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then(cursor => {
                    resolve(this.read(cursor, metadataParse.newable, metadataParse.mapperTable));
                })
                .catch(reject);
        });
    }

    public toListTo<TReader>(newable: new () => TReader, mapperTable: MapperTable): Promise<TReader[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then(cursor => {
                    resolve(this.read(cursor, newable, mapperTable));
                })
                .catch(reject);
        });
    }

    public toCast(): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then(cursor => {
                    resolve(this._queryReadableBuilder.toCast(cursor));
                })
                .catch(reject);
        });
    }

    public map(mapper: (row: any) => any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then(cursor => {
                    resolve(this._queryReadableBuilder.map(cursor, mapper));
                })
                .catch(reject);
        });
    }

    public firstOrDefault(): Promise<T> {
        return new Promise((resolve, reject) => {
            this.limit(1)
                .toList()
                .then(result => {
                    resolve((result && result.length) ? result[0] : void 0)
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    public read<TReader>(cursor: any, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        return this._queryReadableBuilder.read(cursor, newable, mapperTable);
    }

    private getDatabase(database: Database): Database {
        let result = (database ? database : this._database);
        if (!result) {
            throw "Database not specified in query. Call 'executeAndRead'.";
        }
        return result;
    }

    private getMetadata(metadata: MetadataTable<T>): MetadataTable<T> {
        let result = (metadata ? metadata : this._metadata);
        if (!result) {
            throw "MetadataTable not specified in query. Call 'executeAndRead'.";
        }
        return result;
    }
}