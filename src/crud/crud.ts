import { Query } from "./query/query";
import { Insert } from "./insert/insert";
import { Update } from "./update/update";
import { MetadataTable } from "../metadata-table";
import { Delete } from "./delete/delete";
import { DatabaseBase } from "../definitions/database-definition";
import { DatabaseBuilderError } from "../core/errors";
import { GetMapper } from "..";

export class Crud {

    constructor(
        private _database: DatabaseBase = void 0,
        private _getMapper: GetMapper,
        public enableLog: boolean = true) {
    }

    public delete<T>(typeT: new () => T,
                     database: DatabaseBase = this.getDatabase(),
    ): Delete<T> {
        return new Delete(typeT, database, this.enableLog);
    }

    public update<T>(typeT: new () => T, modelToSave: T = void 0, alias: string = void 0,
                     metadata: MetadataTable<T> = this._getMapper.getMapper(typeT),
                     database: DatabaseBase = this.getDatabase(),
    ): Update<T> {
        return new Update(typeT, modelToSave, metadata, alias, database, this.enableLog);
    }

    public insert<T>(typeT: new () => T, modelToSave: T = void 0, alias: string = void 0,
                     metadata: MetadataTable<T> = this._getMapper.getMapper(typeT),
                     database: DatabaseBase = this.getDatabase(),
    ): Insert<T> {
        return new Insert(typeT, modelToSave, metadata, alias, database, this.enableLog);
    }

    public query<T>(typeT: new () => T, alias: string = void 0,
                    metadata: MetadataTable<T> = this._getMapper.getMapper(typeT),
                    database: DatabaseBase = this.getDatabase(),
    ): Query<T> {
        return new Query(typeT, alias, metadata, database, this.enableLog);
    }

    private getDatabase() {
        if (!this._database) {
            throw new DatabaseBuilderError("Transaction ou Database not specified in query.");
        }
        return this._database;
    }
}
