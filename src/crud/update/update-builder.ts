import { UpdateColumnsBuilder } from "./update-columns-builder";
import { WhereBuilder } from "../where-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core";
import { ConfigDatabase } from "../config-database";

export class UpdateBuilder<T> extends CrudBaseBuilder<T, UpdateColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        alias: string = void 0,
        protected readonly _toSave: T = void 0,
        config: ConfigDatabase
    ) {
        super(typeT, mapperTable, config, alias);
    }

    public columns(
        columnsCallback: (columns: UpdateColumnsBuilder<T>) => void,
    ): UpdateBuilder<T> {
        return super.columnsBase(columnsCallback, this.columnsBuilder, this);
    }

    public where(
        whereCallback: (where: WhereBuilder<T>) => void,
    ): UpdateBuilder<T> {
        return super.whereBase(whereCallback, this, false);
    }

    protected buildBase(): QueryCompiled {
        const columnsCompiled = this.getColumnsCompiled();
        return this._commanderBuilder.update(this._tablename, columnsCompiled.columns, columnsCompiled.params[0])
    }

    public getModel(): T {
        return this._toSave;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }

    protected createColumnsBuilder(): UpdateColumnsBuilder<T> {
        return new UpdateColumnsBuilder<T>(this.mapperTable, this._toSave);
    }
}
