import { MetadataTable } from "./../../metadata-table";
import { DatabaseSQLite } from "./../../definitions/database-definition";
import { CreateBuilder } from "./create-builder";
import { DdlBase } from "../ddl-base";

export class Create<T> extends DdlBase<T, CreateBuilder<T>> {

    constructor(
        typeT: new () => T,
        metadata: MetadataTable<T>,
        database: DatabaseSQLite = void 0,
        enableLog: boolean = true,
    ) {
        super(new CreateBuilder(typeT, metadata), database, enableLog);
    }
}
