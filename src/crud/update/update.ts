import { UpdateColumnsBuilder } from "./update-columns-builder";
import { WhereBuilder } from "../where-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { MetadataTable } from "../../metadata-table";
import { UpdateBuilder } from "./update-builder";
import { CrudBase } from "../crud-base";
import { TypeCrud } from "../enums/type-crud";
import { MapperTable } from "../../mapper-table";

export class Update<T> extends CrudBase<T, UpdateBuilder<T>, UpdateColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        modelToSave: T = void 0,
        mapperTable: MapperTable,
        // metadata: MetadataTable<T>,
        alias: string = void 0,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(TypeCrud.UPDATE, new UpdateBuilder(typeT, mapperTable, alias, modelToSave), database, enableLog);
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
