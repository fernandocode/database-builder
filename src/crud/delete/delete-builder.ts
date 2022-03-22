import { DeleteColumnsBuilder } from "./delete-columns-builder";
import { WhereBuilder } from "../where-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { MapperTable } from "../../mapper-table";
import { DatabaseBuilderError, QueryCompiled } from "../../core";
import { KeyUtils } from "../../core/key-utils";
import { ColumnRef } from "../../core/column-ref";
import { Utils } from "../../core/utils";
import { CommanderBuilder } from "../commander-builder";

export class DeleteBuilder<T> extends CrudBaseBuilder<T, DeleteColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        private _toSave: T = void 0,
        mapperTable: MapperTable,
        alias: string = void 0
    ) {
        super(typeT, mapperTable, alias);
        if (!Utils.isNull(_toSave)) {
            this.where(where => {
                where.equal(new ColumnRef(KeyUtils.primaryKeyMapper(mapperTable).column), KeyUtils.getKey(mapperTable, _toSave));
            });
        }
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): DeleteBuilder<T> {
        return super.whereBase(whereCallback, this, false);
    }

    protected buildBase(): QueryCompiled {
        return CommanderBuilder.delete(this._tablename);
    }

    public getModel(): T {
        return this._toSave;
    }

    protected setDefaultColumns(): void {
    }

    protected createColumnsBuilder(): DeleteColumnsBuilder<T> {
        return new DeleteColumnsBuilder<T>(this.mapperTable, this._toSave);
    }
}
