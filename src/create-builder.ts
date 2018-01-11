import { DdlColumnsBuilder } from './columns-base-builder';
import { MetadataTable } from "./metadata-table";
import { DdlBaseBuilder } from "./ddl-base-builder";

export class CreateBuilder<T> extends DdlBaseBuilder<T>{

    constructor(typeT: new () => T, private _metadata: MetadataTable<T>) {
        super(typeT);
    }

    public columns(columnsCallback: (columns: DdlColumnsBuilder<T>) => void): CreateBuilder<T> {
        return super.columnsBase(columnsCallback, new DdlColumnsBuilder<T>(this._metadata), this);
    }

    protected buildBase(): string {
        return `CREATE TABLE IF NOT EXISTS ${this._tablename}(
            ${this._metadata.keyColumn} INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            ${this.getColumnsCompiled().columns.join(", ")}
            );`;
    }

    protected setDefaultColumns(): void {
        this.columns(columns => columns.allColumns());
    }
}