import { UpdateColumnsBuilder } from './update-columns-builder';
import { WhereBuilder } from "./../where-builder";
import { Database } from "./../../definitions/database-definition";
import { MetadataTable } from "./../../metadata-table";
import { UpdateBuilder } from "./update-builder";
import { CrudBase } from "./../crud-base";

export class Update<T> extends CrudBase<T, UpdateBuilder<T>, UpdateColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        modelToSave: T = void 0,
        metadata: MetadataTable<T>,
        alias: string = void 0,
        database: Database = void 0,
        enableLog: boolean = true,
    ) {
        super(new UpdateBuilder(typeT, metadata, alias, modelToSave), database, enableLog);
    }

    public columns(columnsCallback: (columns: UpdateColumnsBuilder<T>) => void): Update<T> {
        this._builder.columns(columnsCallback);
        return this;
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Update<T> {
        this._builder.where(where);
        return this;
    }
}
