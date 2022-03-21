import { Utils, ValueType } from "../../core/utils";
import { InsertColumnsBuilder } from "./insert-columns-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core/query-compiled";
import { CommanderBuilder } from "../batch-insert/commander-builder";

export class InsertBuilder<T> extends CrudBaseBuilder<T, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        alias: string = void 0,
        protected readonly _modelToSave: T = void 0,
    ) {
        super(typeT, mapperTable, alias);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): InsertBuilder<T> {
        return super.columnsBase(columnsCallback,
            new InsertColumnsBuilder<T>(this.mapperTable, this._modelToSave), this);
    }

    protected buildBase(): QueryCompiled {
        const columnsCompiled = this.getColumnsCompiled();
        return CommanderBuilder.batchInsert(this._tablename, columnsCompiled.columns, columnsCompiled.params)?.[0];
    }

    public getModel(): T {
        return this._modelToSave;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
