import { DdlColumnsBuilder } from "../ddl-columns-builder";
import { MetadataTable } from "../../metadata-table";
import { DdlBaseBuilder } from "../ddl-base-builder";
import { DatabaseBuilderError } from "../../core/errors";
import { MapperTable } from "../../mapper-table";
import { DdlCompiled } from "../../core/ddl-compided";
import { Utils } from "../../core/utils";

export class CreateBuilder<T> extends DdlBaseBuilder<T> {

    constructor(
        private _typeT: new () => T,
        // private _typeT: (new () => T) | string,
        // private _metadata: MetadataTable<T>,
        private _mapperTable: MapperTable
    ) {
        super(_typeT && _typeT.name ? _typeT.name : _mapperTable.tableName);
        // Utils.isString(_typeT)
        //     ? _typeT as string
        //     : (_typeT as (new () => T)).name);
        if (_mapperTable === void 0) {
            // if (_metadata === void 0) {
            throw new DatabaseBuilderError(`Mapper not found for '${this._tablename}'`);
        }
    }

    public columns(columnsCallback: (columns: DdlColumnsBuilder<T>) => void): CreateBuilder<T> {
        return super.columnsBase(columnsCallback,
            new DdlColumnsBuilder<T>(this._mapperTable,
                void 0
                // Utils.isString(this._typeT)
                //     ? void 0
                //     : new (this._typeT as (new () => T))()
            )
            , this);
        // return super.columnsBase(columnsCallback, new DdlColumnsBuilder<T>(this._metadata), this);
    }

    protected resolveDependency(dependency: MapperTable): DdlCompiled {
        const create = new CreateBuilder(void 0, dependency);
        // dependency.columns.forEach(column => {
        //     create.columns(x => x.setColumn(column.column, column.fieldType, column.primaryKeyType));
        // });
        return create.build();
    }

    protected dependencies(): MapperTable[] {
        return this._mapperTable.dependencies;
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

    protected sql(): string {
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
