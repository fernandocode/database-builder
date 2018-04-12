import { DeleteColumnsBuilder } from "./delete-columns-builder";
import { WhereBuilder } from "./../where-builder";
import { DatabaseBase } from "./../../definitions/database-definition";
import { CrudBase } from "./../crud-base";
import { DeleteBuilder } from "./delete-builder";

export class Delete<T> extends CrudBase<T, DeleteBuilder<T>, DeleteColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(new DeleteBuilder(typeT), database, enableLog);
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Delete<T> {
        this._builder.where(where);
        return this;
    }
}
