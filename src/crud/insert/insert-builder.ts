import { InsertColumnsBuilder } from "./insert-columns-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core/query-compiled";
import { CommanderBuilder } from "../commander-builder";

export class InsertBuilder<T> extends CrudBaseBuilder<T, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        alias: string = void 0,
        protected readonly _toSave: T | Array<T> = void 0,
    ) {
        super(typeT, mapperTable, alias);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): InsertBuilder<T> {
        return super.columnsBase(columnsCallback, this.columnsBuilder, this);
    }

    protected buildBase(): QueryCompiled {
        const columnsCompiled = this.getColumnsCompiled();
        return CommanderBuilder.batchInsert(this._tablename, columnsCompiled.columns, columnsCompiled.params)?.[0];
    }

    public getModel(): T | Array<T> {
        return this._toSave;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }

    protected createColumnsBuilder(): InsertColumnsBuilder<T> {
        return new InsertColumnsBuilder(this.mapperTable, this._toSave);
    }
}
