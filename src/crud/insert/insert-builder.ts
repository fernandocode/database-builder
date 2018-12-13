import { Utils } from "../../core/utils";
import { InsertColumnsBuilder } from "./insert-columns-builder";
import { CrudBaseBuilder } from "../crud-base-builder";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core/query-compiled";

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
        const parameterValues: any[] = [];

        const columnsCompiled = this.getColumnsCompiled();
        columnsCompiled.columns.forEach((column) => {
            parameterValues.push("?");
        });

        return {
            params: columnsCompiled.params,
            query: Utils.normalizeSqlString(
                `INSERT INTO ${this._tablename}
                    (${columnsCompiled.columns.join(", ")})
                    VALUES (${parameterValues.join(", ")})`
            ),
        };
    }

    public getModel(): T {
        return this._modelToSave;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
