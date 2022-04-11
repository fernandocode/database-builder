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
import { ValueTypeToParse } from "../../core/utils";
import { ModelUtils } from "../../core/model-utils";
import { ConfigDatabase } from "../config-database";

export class Update<T> extends CrudBase<T, UpdateBuilder<T>, UpdateColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        {
            toSave: toSave,
            mapperTable,
            alias,
            database,
            enableLog = true,
            config
        }: {
            toSave?: T,
            mapperTable: MapperTable,
            alias?: string,
            database?: DatabaseBase,
            enableLog?: boolean,
            config: ConfigDatabase
        }
    ) {
        super(TypeCrud.UPDATE, {
            mapperTable, builder: new UpdateBuilder(typeT, mapperTable, alias, toSave, config),
            database, enableLog
        });
    }

    public columns(columnsCallback: (columns: UpdateColumnsBuilder<T>) => void): Update<T> {
        this._builder.columns(columnsCallback);
        return this;
    }

    public where(where: (whereCallback: WhereBuilder<T>) => void): Update<T> {
        this._builder.where(where);
        return this;
    }

    protected compileValuesDependency(dependency: MapperTable, valuesDependencyArray: ValueTypeToParse[][], fieldReferenceSubItem: string): QueryCompiled[] {
        const scripts: QueryCompiled[] = [];
        valuesDependencyArray.forEach((valuesDependency) => {
            if (valuesDependency) {
                const dependenciesListSimpleModel = valuesDependency.map((value, index) => {
                    const valueItem = fieldReferenceSubItem ? ModelUtils.get(value, fieldReferenceSubItem) : value;
                    return {
                        index,
                        value: valueItem,
                        reference: KeyUtils.getKey(this.mapperTable, this.model())
                    } as DependencyListSimpleModel;
                });
                const builder = new InsertBuilder(void 0, dependency, void 0, dependenciesListSimpleModel, this._builder.config);
                this.checkAndPush(scripts, builder.compile());
            }
        });
        return scripts;
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        const deleteBuilder = new DeleteBuilder<DependencyListSimpleModel>(void 0, void 0, dependency, this._builder.config)
            .where(where => {
                const columnReference = dependency.getColumnNameByField<DependencyListSimpleModel, any>(x => x.reference);
                where.equal(new ColumnRef(columnReference), KeyUtils.getKey(this.mapperTable, this.model()));
            });
        return deleteBuilder.compile();
    }
}
