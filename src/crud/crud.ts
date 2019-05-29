import { Query } from "./query/query";
import { Insert } from "./insert/insert";
import { Update } from "./update/update";
import { MetadataTable } from "../metadata-table";
import { Delete } from "./delete/delete";
import { DatabaseBase } from "../definitions/database-definition";
import { DatabaseBuilderError } from "../core/errors";
import { GetMapper } from "../mapper/interface-get-mapper";
import { Utils } from "../core/utils";
import { KeyUtils } from "../core/key-utils";
import { QueryBuilder } from "./query/query-builder";
import { MetadataTableBase } from "../metadata-table-base";

export class Crud {

    constructor(
        private _database: DatabaseBase = void 0,
        private _getMapper: GetMapper,
        public enableLog: boolean = true) {
    }

    public delete<T>(
        typeT: new () => T,
        modelToSave: T = void 0,
        metadata: MetadataTable<T> = this.getMapper(typeT),
        database: DatabaseBase = this.getDatabase()
    ): Delete<T> {
        return new Delete(typeT, modelToSave, metadata.mapperTable, database, this.enableLog);
    }

    public deleteByKey<T>(
        typeT: new () => T,
        key: any,
        metadata: MetadataTable<T> = this.getMapper(typeT),
        database: DatabaseBase = this.getDatabase()
    ): Delete<T> {
        const obj = {} as T;
        KeyUtils.setKey(metadata.mapperTable, obj, key);
        return new Delete(typeT, obj, metadata.mapperTable, database, this.enableLog);
    }

    public update<T>(
        typeT: new () => T, modelToSave: T = void 0, alias: string = void 0,
        metadata: MetadataTable<T> = this.getMapper(typeT),
        database: DatabaseBase = this.getDatabase(),
    ): Update<T> {
        return new Update(typeT, modelToSave, metadata.mapperTable, alias, database, this.enableLog);
    }

    public insert<T>(
        typeT: new () => T, modelToSave: T = void 0, alias: string = void 0,
        metadata: MetadataTable<T> = this.getMapper(typeT),
        database: DatabaseBase = this.getDatabase(),
    ): Insert<T> {
        return new Insert(typeT, modelToSave, metadata.mapperTable, alias, database, this.enableLog);
    }

    public query<T>(
        typeT: (new () => T) | QueryBuilder<T> | { _builder: () => QueryBuilder<T> }, alias: string = void 0,
        metadata?: MetadataTableBase<T>,
        database: DatabaseBase = this.getDatabase(),
    ): Query<T> {
        if (typeT && (typeT as { _builder: () => QueryBuilder<T> })._builder) {
            typeT = (typeT as { _builder: () => QueryBuilder<T> })._builder();
        }
        if (Utils.isNull(metadata)) {
            metadata = Utils.getMapperTable(typeT, (tKey: (new () => any) | string) => {
                return this._getMapper.get(tKey);
            });
        }
        const that = this;
        return new Query(typeT as (new () => T) | QueryBuilder<T>, alias,
            (tKey: (new () => any) | string) => {
                return that.getMapper(tKey);
            }, metadata.mapperTable, database, this.enableLog);
    }

    private getDatabase() {
        if (!this._database) {
            throw new DatabaseBuilderError("Transaction ou Database not specified in query.");
        }
        return this._database;
    }

    private getMapper<T>(tKey: (new () => T) | string): MetadataTable<T> {
        const metadata = this._getMapper.get(tKey);
        if (Utils.isNull(metadata)) {
            throw new DatabaseBuilderError(`Mapper for "${Utils.isString(tKey) ? tKey : (tKey as new () => T).name}" not found!"`);
        }
        return metadata;
    }
}
