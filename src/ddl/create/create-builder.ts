import { DdlColumnsBuilder } from "../ddl-columns-builder";
import { DdlBaseBuilder } from "../ddl-base-builder";
import { DatabaseBuilderError } from "../../core/errors";
import { MapperTable } from "../../mapper-table";
import { DdlCompiled } from "../../core/ddl-compided";
import { Utils } from "../../core/utils";

export class CreateBuilder<T> extends DdlBaseBuilder<T> {

    constructor(
        typeT: new () => T,
        private _mapperTable: MapperTable
    ) {
        super(_mapperTable.tableName);
        if (Utils.isNull(_mapperTable)) {
            throw new DatabaseBuilderError(`Mapper not found for '${this._tablename}'`);
        }
    }

    public columns(columnsCallback: (columns: DdlColumnsBuilder<T>) => void): CreateBuilder<T> {
        return super.columnsBase(
            columnsCallback,
            new DdlColumnsBuilder<T>(
                this._mapperTable,
                void 0
            ),
            this);
    }

    protected resolveDependency(dependency: MapperTable): DdlCompiled {
        const create = new CreateBuilder(void 0, dependency);
        return create.build();
    }

    protected dependencies(): MapperTable[] {
        return this._mapperTable.dependencies;
    }

    protected buildBase(): string {
        const columns = this.getColumnsCompiled();
        const primaryColumns = columns.keyColumns.length > 1
            ? `, PRIMARY KEY (${columns.keyColumns.join(", ")})`
            : "";
        return `CREATE TABLE IF NOT EXISTS ${this._tablename}(
            ${columns.columns.join(", ")}
            ${primaryColumns}
            )`;
    }

    protected setDefaultColumns(): void {
        this.columns((columns) => columns.allColumns());
    }
}
