import { DatabaseBase } from "../../definitions/database-definition";
import { DropBuilder } from "./drop-builder";
import { DdlBase } from "../ddl-base";
import { MapperTable } from "../../mapper-table";

export class Drop<T> extends DdlBase<T, DropBuilder<T>> {

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new DropBuilder(typeT, mapperTable), database, enableLog);
    }
}
