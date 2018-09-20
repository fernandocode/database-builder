import { Utils } from "../../core/utils";
import { InsertColumnsBuilder } from "./insert-columns-builder";
import { MetadataTable } from "../../metadata-table";
import { CrudBaseBuilder } from "../crud-base-builder";
import { CrudCompiled } from "../../core/crud-compiled";
import { TypeCrud } from "../enums/type-crud";

export class InsertBuilder<T> extends CrudBaseBuilder<T, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        metadata: MetadataTable<T>,
        alias: string = void 0,
        protected readonly _modelToSave: T = void 0,
    ) {
        super(typeT, metadata, alias);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): InsertBuilder<T> {
        return super.columnsBase(columnsCallback,
            new InsertColumnsBuilder<T>(this.metadata, this._modelToSave), this);
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

    public getModel(): T {
        return this._modelToSave;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
