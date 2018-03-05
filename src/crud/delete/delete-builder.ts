import { DeleteColumnsBuilder } from "./delete-columns-builder";
import { WhereBuilder } from "./../where-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { CrudCompiled } from "../../core/crud-compiled";

export class DeleteBuilder<T> extends CrudBaseBuilder<T, DeleteColumnsBuilder<T>> {

    constructor(typeT: new () => T, alias: string = void 0) {
        super(typeT, alias);
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): DeleteBuilder<T> {
        return super.whereBase(whereCallback, this, false);
    }

    protected buildBase(): CrudCompiled {
        return {
            params: [],
            sql: `DELETE FROM ${this._tablename}`,
        };
    }

    protected setDefaultColumns(): void {
    }
}
