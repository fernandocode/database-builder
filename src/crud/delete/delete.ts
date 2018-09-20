import { DeleteColumnsBuilder } from "./delete-columns-builder";
import { WhereBuilder } from "../where-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { CrudBase } from "../crud-base";
import { DeleteBuilder } from "./delete-builder";
import { TypeCrud } from "../enums/type-crud";

export class Delete<T> extends CrudBase<T, DeleteBuilder<T>, DeleteColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(TypeCrud.DELETE, new DeleteBuilder(typeT), database, enableLog);
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Delete<T> {
        this._builder.where(where);
        return this;
    }
}
