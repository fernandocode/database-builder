import { MetadataTable } from "../../metadata-table";
import { DatabaseBase } from "../../definitions/database-definition";
import { CreateBuilder } from "./create-builder";
import { DdlBase } from "../ddl-base";
import { MapperTable } from "../../mapper-table";

export class Create<T> extends DdlBase<T, CreateBuilder<T>> {

    constructor(
        typeT: new () => T,
        // metadata: MetadataTable<T>,
        mapperTable: MapperTable,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new CreateBuilder(typeT, mapperTable), database, enableLog);
    }
}
