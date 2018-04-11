import { HavingBuilder } from "./../having-builder";
import { QueryReadableBuilder } from "./query-readable-builder";
import { QueryCompiled } from "./../../core/query-compiled";
import { MapperTable } from "./../../mapper-table";
import { ProjectionBuilder } from "./../projection-builder";
import { WhereBuilder } from "./../where-builder";
import { DatabaseSQLite } from "./../../definitions/database-definition";
import { MetadataTable } from "./../../metadata-table";
import { ResultExecuteSql } from "./../../core/result-execute-sql";
import { QueryBuilder } from "./query-builder";
import { ExpressionOrColumn, ValueType } from "./../../core/utils";
import { QueryCompilable } from "./../../core/query-compilable";
import { OrderBy } from "../../core/enums/order-by";
import { JoinType } from "../enums/join-type";
import { LambdaExpression } from "lambda-expression";
import { JoinQueryBuilder } from "./join-query-builder";
import { DatabaseBuilderError } from "../../core/errors";
import { ProjectionsHelper } from "../../core/projections-helper";
import { ColumnRef } from "../../core/column-ref";

export class Query<T> implements QueryCompilable {

    private _queryBuilder: QueryBuilder<T>;
    private _queryReadableBuilder: QueryReadableBuilder<T>;

    constructor(
        typeT: new () => T,
        alias: string = void 0,
        private _metadata: MetadataTable<T> = void 0,
        private _database: DatabaseSQLite = void 0,
        enableLog: boolean = true,
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

    public ref(expression: ExpressionOrColumn<T>): ColumnRef {
        return this._queryBuilder.ref(expression);
    }

    public from(query: QueryCompiled | QueryCompilable): Query<T> {
        this._queryBuilder.from(query);
        return this;
    }

    public union(query: QueryCompiled | QueryCompilable): Query<T> {
        this._queryBuilder.union(query);
        return this;
    }

    public join<TJoin>(
        typeTJoin: new () => TJoin,
        onWhere: (where: WhereBuilder<TJoin>) => void,
        join: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0
    ): Query<T> {
        this._queryBuilder.join(typeTJoin, onWhere, join, type, alias);
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
     * @deprecated Use `select`
     * @param projectionCallback
     */
    public projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): Query<T> {
        this._queryBuilder.projection(projectionCallback);
        return this;
    }

    public select(...expressions: Array<ExpressionOrColumn<T>>): Query<T> {
        this._queryBuilder.select(...expressions);
        return this;
    }

    public limit(limit: number, offset?: number): Query<T> {
        this._queryBuilder.limit(limit, offset);
        return this;
    }

    public orderBy(expression: ExpressionOrColumn<T>, order: OrderBy = OrderBy.ASC): Query<T> {
        this._queryBuilder.orderBy(expression, order);
        return this;
    }

    public asc(expression: ExpressionOrColumn<T>): Query<T> {
        this._queryBuilder.asc(expression);
        return this;
    }

    public desc(expression: ExpressionOrColumn<T>): Query<T> {
        this._queryBuilder.desc(expression);
        return this;
    }

    public groupBy(
        expression: ExpressionOrColumn<T>,
        havingCallback?: (having: HavingBuilder<T>, projection: ProjectionsHelper<T>) => void
    ): Query<T> {
        this._queryBuilder.groupBy(expression, havingCallback);
        return this;
    }

    public execute(database: DatabaseSQLite = void 0): Promise<ResultExecuteSql> {
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
        database: DatabaseSQLite = void 0,
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
                .then((cursor) => {
                    resolve(this._queryReadableBuilder.toCast(cursor));
                })
                .catch(reject);
        });
    }

    public map(mapper: (row: any) => any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.execute()
                .then((cursor) => {
                    resolve(this._queryReadableBuilder.map(cursor, mapper));
                })
                .catch(reject);
        });
    }

    public firstOrDefault(): Promise<T> {
        return new Promise((resolve, reject) => {
            this.limit(1)
                .toList()
                .then((result) => {
                    resolve((result && result.length) ? result[0] : void 0);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public read<TReader>(cursor: any, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        return this._queryReadableBuilder.read(cursor, newable, mapperTable);
    }

    private getDatabase(database: DatabaseSQLite): DatabaseSQLite {
        const result = (database ? database : this._database);
        if (!result) {
            throw new DatabaseBuilderError("Database not specified in query. Call 'executeAndRead'.");
        }
        return result;
    }

    private getMetadata(metadata: MetadataTable<T>): MetadataTable<T> {
        const result = (metadata ? metadata : this._metadata);
        if (!result) {
            throw new DatabaseBuilderError("MetadataTable not specified in query. Call 'executeAndRead'.");
        }
        return result;
    }
}
