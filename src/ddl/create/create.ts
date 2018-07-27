import { MetadataTable } from "../../metadata-table";
import { DatabaseBase } from "../../definitions/database-definition";
import { CreateBuilder } from "./create-builder";
import { DdlBase } from "../ddl-base";

export class Create<T> extends DdlBase<T, CreateBuilder<T>> {

    constructor(
        typeT: new () => T,
        metadata: MetadataTable<T>,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new CreateBuilder(typeT, metadata), database, enableLog);
    }
}
