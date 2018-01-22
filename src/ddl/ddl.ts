import { Drop } from "./drop/drop";
import { Create } from "./create/create";
import { MetadataTable } from "./../metadata-table";
import { Database } from "./../definitions/database-definition";
import { GetMapper } from "../definitions/interface-get-mapper";

export class Ddl {

    constructor(
        private _database: Database = void 0,
        private _mappersTable: GetMapper,
        public enableLog: boolean = true) {
    }

    public create<T>(typeT: new () => T,
                     metadata: MetadataTable<T> = this._mappersTable.getMapper(typeT),
                     database: Database = this.getDatabase(),
    ): Create<T> {
        return new Create(typeT, metadata, database, this.enableLog);
    }

    public drop<T>(typeT: new () => T,
                   database: Database = this.getDatabase(),
    ): Drop<T> {
        return new Drop(typeT, database, this.enableLog);
    }

    // TODO: create ALTER TABLE: https://sqlite.org/lang_altertable.html

    private getDatabase() {
        if (!this._database) {
            throw new Error("Transaction ou Database not specified in query.");
        }
        return this._database;
    }
}
