import { UpdateColumnsBuilder } from "./update-columns-builder";
import { WhereBuilder } from "../where-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { UpdateBuilder } from "./update-builder";
import { CrudBase } from "../crud-base";
import { TypeCrud } from "../enums/type-crud";
import { MapperTable } from "../../mapper-table";
import { QueryCompiled } from "../../core/query-compiled";
import { DependencyListSimpleModel } from "../../definitions/dependency-definition";
import { DeleteBuilder } from "../delete/delete-builder";
import { InsertBuilder } from "../insert/insert-builder";
import { KeyUtils } from "../../core/key-utils";
import { ColumnRef } from "../../core/column-ref";

export class Update<T> extends CrudBase<T, UpdateBuilder<T>, UpdateColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        {
            toSave: toSave,
            mapperTable,
            alias,
            database,
            enableLog = true
        }: {
            toSave?: T,
            mapperTable: MapperTable,
            alias?: string,
            database?: DatabaseBase,
            enableLog?: boolean
        }
    ) {
        super(TypeCrud.UPDATE, { mapperTable, builder: new UpdateBuilder(typeT, mapperTable, alias, toSave), database, enableLog });
    }

    public columns(columnsCallback: (columns: UpdateColumnsBuilder<T>) => void): Update<T> {
        this._builder.columns(columnsCallback);
        return this;
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Update<T> {
        this._builder.where(where);
        return this;
    }

    protected resolveDependencyByValue(dependency: MapperTable, value: any, index: number): QueryCompiled {
        const builder = new InsertBuilder(void 0, dependency, void 0,
            {
                index,
                value,
                reference: KeyUtils.getKey(this.mapperTable, this.model())
            } as DependencyListSimpleModel
        );
        return builder.compile();
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        const deleteBuilder = new DeleteBuilder<DependencyListSimpleModel>(void 0, void 0, dependency)
            .where(where => {
                const columnReference = dependency.getColumnNameByField<DependencyListSimpleModel, any>(x => x.reference);
                where.equal(new ColumnRef(columnReference), KeyUtils.getKey(this.mapperTable, this.model()));
            });
        return deleteBuilder.compile();
    }
}
