import { DatabaseBase } from "./../../definitions/database-definition";
import { DdlBase } from "./../ddl-base";
import { DropBuilder } from "./drop-builder";

export class Drop<T> extends DdlBase<T, DropBuilder<T>> {

    constructor(
        typeT: new () => T,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new DropBuilder(typeT), database, enableLog);
    }
}
