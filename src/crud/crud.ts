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
import { MapperUtils } from "../mapper/mapper-utils";
import { ConfigCommander } from "./config-commander";

export class Crud {
    public enableLog: boolean;
    private _database: DatabaseBase;
    private _getMapper: GetMapper;

    constructor(
        private _config: ConfigCommander,
        {
            getMapper,
            database,
            enableLog = true
        }: {
            getMapper?: GetMapper,
            database?: DatabaseBase,
            enableLog?: boolean
        } = {}
    ) {
        this._getMapper = getMapper;
        this._database = database;
        this.enableLog = enableLog;
    }

    public delete<T>(
        typeT: new () => T,
        {
            modelToSave = void 0,
            metadata = this.getMapper(typeT),
            database = this.getDatabase()
        }: {
            modelToSave?: T,
            metadata?: MetadataTable<T>,
            database?: DatabaseBase
        } = {}
    ): Delete<T> {
        return new Delete(typeT, {
            modelToSave, mapperTable: metadata.mapperTable, database, enableLog: this.enableLog, config: this._config
        });
    }

    public deleteByKey<T>(
        typeT: new () => T,
        key: any,
        {
            metadata = this.getMapper(typeT),
            database = this.getDatabase()
        }: {
            metadata?: MetadataTable<T>,
            database?: DatabaseBase
        } = {}
    ): Delete<T> {
        const obj = {} as T;
        KeyUtils.setKey(metadata.mapperTable, obj, key);
        return new Delete(typeT, {
            modelToSave: obj, mapperTable: metadata.mapperTable, database, enableLog: this.enableLog, config: this._config
        });
    }

    public update<T>(
        typeT: new () => T,
        {
            toSave,
            alias,
            metadata = this.getMapper(typeT),
            database = this.getDatabase()
        }: {
            toSave?: T,
            alias?: string
            metadata?: MetadataTable<T>,
            database?: DatabaseBase
        } = {}
    ): Update<T> {
        return new Update(typeT, {
            toSave: toSave, mapperTable: metadata.mapperTable, alias, database, enableLog: this.enableLog, config: this._config
        });
    }

    public insert<T>(
        typeT: new () => T,
        {
            toSave,
            alias,
            metadata = this.getMapper(typeT),
            database = this.getDatabase()
        }: {
            toSave?: T | Array<T>,
            alias?: string
            metadata?: MetadataTable<T>,
            database?: DatabaseBase
        } = {}
    ): Insert<T> {
        return new Insert(typeT, {
            toSave: toSave, mapperTable: metadata.mapperTable, alias, database, enableLog: this.enableLog, config: this._config
        });
    }

    public query<T>(
        typeT: (new () => T) | QueryBuilder<T> | { _builder: () => QueryBuilder<T> },
        {
            alias,
            metadata,
            database = this.getDatabase()
        }: {
            alias?: string
            metadata?: MetadataTableBase<T>,
            database?: DatabaseBase
        } = {}
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
        return new Query(
            typeT as (new () => T) | QueryBuilder<T>,
            {
                alias,
                getMapper: (tKey: (new () => any) | string) => {
                    return that.getMapper(tKey);
                },
                mapperTable: metadata.mapperTable,
                database,
                enableLog: this.enableLog
            }
        );
    }

    private getDatabase() {
        return this._database;
    }

    private getMapper<T>(tKey: (new () => T) | string): MetadataTable<T> {
        const metadata = this._getMapper.get(tKey);
        if (Utils.isNull(metadata)) {
            throw new DatabaseBuilderError(`Mapper for "${MapperUtils.resolveKey(tKey)}" not found!"`);
        }
        return metadata;
    }
}
