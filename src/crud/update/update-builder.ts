import { UpdateColumnsBuilder } from "./update-columns-builder";
import { WhereBuilder } from "../where-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core";
import { CommanderBuilder } from "../batch-insert/commander-builder";

export class UpdateBuilder<T> extends CrudBaseBuilder<T, UpdateColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        alias: string = void 0,
        protected readonly _modelToSave: T = void 0,
    ) {
        super(typeT, mapperTable, alias);
    }

    public columns(
        columnsCallback: (columns: UpdateColumnsBuilder<T>) => void,
    ): UpdateBuilder<T> {
        return super.columnsBase(columnsCallback, new UpdateColumnsBuilder<T>(this.mapperTable, this._modelToSave), this);
    }

    public where(
        whereCallback: (where: WhereBuilder<T>) => void,
    ): UpdateBuilder<T> {
        return super.whereBase(whereCallback, this, false);
    }

    protected buildBase(): QueryCompiled {
        const columnsCompiled = this.getColumnsCompiled();
        return CommanderBuilder.update(this._tablename, columnsCompiled.columns, columnsCompiled.params[0])
    }

    public getModel(): T {
        return this._modelToSave;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
