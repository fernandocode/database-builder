import { InsertColumnsBuilder } from "./insert-columns-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { CrudBase } from "../crud-base";
import { InsertBuilder } from "./insert-builder";
import { TypeCrud } from "../enums/type-crud";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core";
import { DependencyListSimpleModel } from "../../definitions/dependency-definition";
import { ReplacementParam } from "../../core/replacement-param";

export class Insert<T> extends CrudBase<T, InsertBuilder<T>, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        modelToSave: T,
        mapperTable: MapperTable,
        alias: string = void 0,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(TypeCrud.CREATE, mapperTable, new InsertBuilder(typeT, mapperTable, alias, modelToSave), database, enableLog);
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): Insert<T> {
        this._builder.columns(columnsCallback);
        return this;
    }

    protected resolveDependencyByValue(dependency: MapperTable, value: any, index: number): QueryCompiled {
        const builder = new InsertBuilder(void 0, dependency, void 0,
            {
                index,
                value,
                reference: new ReplacementParam("0", "insertId")
            } as DependencyListSimpleModel
        );
        return builder.compile();
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        return void 0;
    }
}
