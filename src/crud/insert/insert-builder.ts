import { Utils } from "../../core/utils";
import { InsertColumnsBuilder } from "./insert-columns-builder";
import { MetadataTable } from "../../metadata-table";
import { CrudBaseBuilder } from "../crud-base-builder";
import { CrudCompiled } from "../../core/crud-compiled";

export class InsertBuilder<T> extends CrudBaseBuilder<T, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        private _metadata: MetadataTable<T>,
        alias: string = void 0,
        protected readonly _modelToSave: T = void 0,
    ) {
        super(typeT, alias);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): InsertBuilder<T> {
        return super.columnsBase(columnsCallback,
            new InsertColumnsBuilder<T>(this._metadata, this._modelToSave), this);
    }

    protected buildBase(): CrudCompiled {
        const parameterValues: any[] = [];

        const columnsCompiled = this.getColumnsCompiled();
        columnsCompiled.columns.forEach((column) => {
            parameterValues.push("?");
        });

        return {
            params: columnsCompiled.params,
            sql: Utils.normalizeSqlString(
                `INSERT INTO ${this._tablename}
                    (${columnsCompiled.columns.join(", ")})
                    VALUES (${parameterValues.join(", ")})`
            ),
        };
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
