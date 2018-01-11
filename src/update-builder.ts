import { UpdateColumnsBuilder } from './columns-builder';
import { WhereBuilder } from './where-builder';

import { CrudBaseBuilder } from "./crud-base-builder";
import { MetadataTable } from "./metadata-table";
import { CrudCompiled } from "./utils";

export class UpdateBuilder<T> extends CrudBaseBuilder<T, UpdateColumnsBuilder<T>>{

    constructor(typeT: new () => T, private _metadata: MetadataTable<T>, alias: string = void 0, modelToSave: T = void 0) {
        super(typeT, alias, modelToSave);
    }

    public columns(columnsCallback: (columns: UpdateColumnsBuilder<T>) => void): UpdateBuilder<T> {
        return super.columnsBase(columnsCallback, new UpdateColumnsBuilder<T>(this._metadata, this._modelToSave), this);
    }

    public where(whereCallback: (where: WhereBuilder<T>) => void): UpdateBuilder<T> {
        return super.whereBase(whereCallback, this);
    }

    protected buildBase(): CrudCompiled {
        return {
            sql: `UPDATE ${this._tablename} SET ${this.getColumnsCompiled().columns.join(", ")}`,
            params: this.getColumnsCompiled().params
        };
    }

    protected setDefaultColumns(): void {
        this.columns(columns => columns.allColumns());
    }
}