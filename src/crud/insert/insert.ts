import { InsertColumnsBuilder } from "./insert-columns-builder";
import { DatabaseBase } from "../../definitions/database-definition";
import { CrudBase } from "../crud-base";
import { InsertBuilder } from "./insert-builder";
import { TypeCrud } from "../enums/type-crud";
import { MapperTable } from "../../mapper-table";
import { DatabaseBuilderError, QueryCompiled } from "../../core";
import { DependencyListSimpleModel } from "../../definitions/dependency-definition";
import { ReplacementParam } from "../../core/replacement-param";
import { PrimaryKeyType } from "../../core/enums/primary-key-type";
import { ModelUtils } from "../../core/model-utils";

export class Insert<T> extends CrudBase<T, InsertBuilder<T>, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        {
            modelToSave,
            mapperTable,
            alias,
            database,
            enableLog = true
        }: {
            modelToSave: T,
            mapperTable: MapperTable,
            alias?: string,
            database?: DatabaseBase,
            enableLog?: boolean
        }
    ) {
        super(TypeCrud.CREATE, { mapperTable, builder: new InsertBuilder(typeT, mapperTable, alias, modelToSave), database, enableLog });
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): Insert<T> {
        this._builder.columns(columnsCallback);
        return this;
    }

    protected resolveDependencyByValue(dependency: MapperTable, value: any, index: number): QueryCompiled {
        const modelBase = this.model();
        const modelDependency = {
            index,
            value,
            // reference: new ReplacementParam("0", "insertId")
        } as DependencyListSimpleModel;
        // Verificar se é Assigned a estrategia de Id, se for já adicionar como parametro
        if (this.mapperTable.keyColumns().length > 1) {
            throw new DatabaseBuilderError("Mapper with composite id not supported hasMany dependence");
        }
        const keyMapperBase = this.mapperTable.keyColumns()[0];
        switch (keyMapperBase.primaryKeyType) {
            case PrimaryKeyType.Assigned:
            case PrimaryKeyType.Guid:
                modelDependency.reference = ModelUtils.get(modelBase, keyMapperBase.fieldReference);
                if (modelDependency.reference === void 0) {
                    throw new DatabaseBuilderError(`Reference for dependency '${dependency.tableName}' of '${this.mapperTable.tableName}' don´t could be obtido!`);
                }
                break;
            case PrimaryKeyType.AutoIncrement:
                modelDependency.reference = new ReplacementParam("0", "insertId");
                break;
            default:
                break;
        }
        const builder = new InsertBuilder(void 0, dependency, void 0, modelDependency);
        return builder.compile();
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        return void 0;
    }
}
