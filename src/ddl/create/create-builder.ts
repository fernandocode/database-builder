import { DdlColumnsBuilder } from "../ddl-columns-builder";
import { MetadataTable } from "../../metadata-table";
import { DdlBaseBuilder } from "../ddl-base-builder";
import { DatabaseBuilderError } from "../..";

export class CreateBuilder<T> extends DdlBaseBuilder<T> {

    constructor(typeT: new () => T, private _metadata: MetadataTable<T>) {
        super(typeT.name);
        if (_metadata === void 0) {
            throw new DatabaseBuilderError(`Mapper not found for '${typeT.name}'`);
        }
    }

    public columns(columnsCallback: (columns: DdlColumnsBuilder<T>) => void): CreateBuilder<T> {
        return super.columnsBase(columnsCallback, new DdlColumnsBuilder<T>(this._metadata), this);
    }

    protected buildBase(): string {
        const columns = this.getColumnsCompiled();
        // ${this._metadata.keyColumn} INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        const primaryColumns = columns.keyColumns.length > 1
            ? `, PRIMARY KEY (${columns.keyColumns.join(", ")})`
            : "";
        return `CREATE TABLE IF NOT EXISTS ${this._tablename}(
            ${columns.columns.join(", ")}
            ${primaryColumns}
            );`;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
