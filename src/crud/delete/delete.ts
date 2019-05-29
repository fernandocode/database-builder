import { DeleteColumnsBuilder } from "./delete-columns-builder";
import { WhereBuilder } from "../where-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { CrudBase } from "../crud-base";
import { DeleteBuilder } from "./delete-builder";
import { TypeCrud } from "../enums/type-crud";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core/query-compiled";
import { DependencyListSimpleModel } from "../../definitions/dependency-definition";
import { KeyUtils } from "../../core/key-utils";
import { ColumnRef } from "../../core/column-ref";
import { DatabaseBuilderError } from "../../core";
import { Utils } from "../../core/utils";

export class Delete<T> extends CrudBase<T, DeleteBuilder<T>, DeleteColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        modelToSave: T = void 0,
        mapperTable: MapperTable,
        database: DatabaseBase = void 0,
        enableLog: boolean = true,
    ) {
        super(TypeCrud.DELETE, mapperTable, new DeleteBuilder(typeT, modelToSave, mapperTable), database, enableLog);
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Delete<T> {
        this._builder.where(where);
        return this;
    }

    protected resolveDependencyByValue(dependency: MapperTable, value: any, index: number): QueryCompiled {
        const builder = new DeleteBuilder(void 0, void 0, dependency);
        return builder.compile();
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        const deleteBuilder = new DeleteBuilder<DependencyListSimpleModel>(void 0, void 0, dependency)
            .where(where => {
                const columnReference = dependency.getColumnNameByField<DependencyListSimpleModel, any>(x => x.reference);
                if (Utils.isNull(this.model())) {
                    throw new DatabaseBuilderError(`Without the entity data to be deleted it is not possible to delete dependent items by cascade.`);
                }
                where.equal(new ColumnRef(columnReference), KeyUtils.getKey(this.mapperTable, this.model()));
            });
        return deleteBuilder.compile();
    }

    protected compileDependencyByValue(dependency: MapperTable): QueryCompiled[] {
        return [];
    }
}