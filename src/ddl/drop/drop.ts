import { DatabaseBase } from "./../../definitions/database-definition";
import { DdlBase } from "./../ddl-base";
import { DropBuilder } from "./drop-builder";
import { TypeOrString } from "../../core/utils";

export class Drop<T> extends DdlBase<T, DropBuilder<T>> {

    constructor(
        typeT: TypeOrString<T>,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new DropBuilder(typeT), database, enableLog);
    }
}
