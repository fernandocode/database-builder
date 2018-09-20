import { TypeOrString } from "../../core/utils";
import { DatabaseBase } from "../../definitions/database-definition";
import { DropBuilder } from "./drop-builder";
import { DdlBase } from "../ddl-base";

export class Drop<T> extends DdlBase<T, DropBuilder<T>> {

    constructor(
        typeT: TypeOrString<T>,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new DropBuilder(typeT), database, enableLog);
    }
}
