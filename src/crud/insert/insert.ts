import { InsertColumnsBuilder } from "./insert-columns-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { MetadataTable } from "../../metadata-table";
import { CrudBase } from "../crud-base";
import { InsertBuilder } from "./insert-builder";
import { TypeCrud } from "../enums/type-crud";
import { MapperTable } from "../../mapper-table";

export class Insert<T> extends CrudBase<T, InsertBuilder<T>, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        modelToSave: T,
        mapperTable: MapperTable,
        // metadata: MetadataTable<T>,
        alias: string = void 0,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(TypeCrud.CREATE, new InsertBuilder(typeT, mapperTable, alias, modelToSave), database, enableLog);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): Insert<T> {
        this._builder.columns(columnsCallback);
        return this;
    }
}
