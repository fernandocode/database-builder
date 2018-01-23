import { InsertColumnsBuilder } from './insert-columns-builder';
import { MetadataTable } from "./../../metadata-table";
import { CrudBaseBuilder } from "../crud-base-builder";
import { CrudCompiled } from "../../core/crud-compiled";

export class InsertBuilder<T> extends CrudBaseBuilder<T, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        private _metadata: MetadataTable<T>,
        alias: string = void 0,
        modelToSave: T = void 0,
    ) {
        super(typeT, alias, modelToSave);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): InsertBuilder<T> {
        return super.columnsBase(columnsCallback,
            new InsertColumnsBuilder<T>(this._metadata, this._modelToSave), this);
    }

    protected buildBase(): CrudCompiled {
        const parameterValues: any[] = [];
        this.getColumnsCompiled().columns.forEach((column) => {
            parameterValues.push("?");
        });

        return {
            params: this.getColumnsCompiled().params,
            sql: `INSERT INTO ${this._tablename}
            (${this.getColumnsCompiled().columns.join(", ")})
            VALUES (${parameterValues.join(", ")})`,
        };
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
