import { Drop } from "./drop/drop";
import { Create } from "./create/create";
import { MetadataTable } from "./../metadata-table";
import { DatabaseBase } from "./../definitions/database-definition";
import { GetMapper } from "../definitions/interface-get-mapper";
import { DatabaseBuilderError } from "../core/errors";
import { TypeOrString } from "../core/utils";

export class Ddl {

    constructor(
        private _database: DatabaseBase = void 0,
        private _mappersTable: GetMapper,
        public enableLog: boolean = true) {
    }

    public create<T>(typeT: new () => T,
                     metadata: MetadataTable<T> = this._mappersTable.getMapper(typeT),
                     database: DatabaseBase = this.getDatabase(),
    ): Create<T> {
        return new Create(typeT, metadata, database, this.enableLog);
    }

    public drop<T>(typeT: TypeOrString<T>,
                   database: DatabaseBase = this.getDatabase(),
    ): Drop<T> {
        return new Drop(typeT, database, this.enableLog);
    }

    // TODO: create ALTER TABLE: https://sqlite.org/lang_altertable.html

    private getDatabase() {
        if (!this._database) {
            throw new DatabaseBuilderError("Transaction ou Database not specified in query.");
        }
        return this._database;
    }
}
