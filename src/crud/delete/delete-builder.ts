import { WhereBuilder } from './../where-builder';
import { CrudCompiled } from "./../../core/utils";
import { DeleteColumnsBuilder } from "../columns-builder";
import { CrudBaseBuilder } from "../crud-base-builder";

export class DeleteBuilder<T> extends CrudBaseBuilder<T, DeleteColumnsBuilder<T>>{

    constructor(typeT: new () => T, alias: string = void 0) {
        super(typeT, alias);
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): DeleteBuilder<T> {
        return super.whereBase(whereCallback, this, false);
    }

    protected buildBase(): CrudCompiled {
        return {
            sql: `DELETE FROM ${this._tablename}`,
            params: []
        };
    }

    protected setDefaultColumns(): void {
    }
}