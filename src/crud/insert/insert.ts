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
import { Utils, ValueTypeToParse } from "../../core/utils";
import { ConfigDatabase } from "../config-database";

export class Insert<T> extends CrudBase<T, InsertBuilder<T>, InsertColumnsBuilder<T>> {

    constructor(
        typeT: new () => T,
        {
            toSave,
            mapperTable,
            alias,
            database,
            enableLog = true,
            config,
        }: {
            toSave?: T | Array<T>,
            mapperTable: MapperTable,
            alias?: string,
            database?: DatabaseBase,
            enableLog?: boolean,
            config: ConfigDatabase
        }
    ) {
        super(TypeCrud.CREATE, { mapperTable, builder: new InsertBuilder(typeT, mapperTable, alias, toSave, config), database, enableLog });
    }

    public columns(columnsCallback: (columns: InsertColumnsBuilder<T>) => void): Insert<T> {
        this._builder.columns(columnsCallback);
        return this;
    }

    protected compileValuesDependency(
        dependency: MapperTable, valuesDependencyArray: ValueTypeToParse[][], fieldReferenceSubItem: string
    ): QueryCompiled[] {
        const scripts: QueryCompiled[] = [];
        let dependenciesToInsert: Array<DependencyListSimpleModel> = [];
        valuesDependencyArray.forEach((valuesDependency, indexHeader) => {
            if (valuesDependency) {
                const dependenciesListSimpleModel = valuesDependency.map((value, indexCascade) => {
                    const valueItem = fieldReferenceSubItem ? ModelUtils.get(value, fieldReferenceSubItem) : value;
                    return this.createDependencyListSimpleModel(dependency, valueItem, indexCascade, indexHeader);
                });
                dependenciesToInsert = [...dependenciesToInsert, ...dependenciesListSimpleModel];
            }
        });
        if (dependenciesToInsert.length > 0) {
            const builder = new InsertBuilder(void 0, dependency, void 0, dependenciesToInsert, this._builder.config);
            this.checkAndPush(scripts, builder.compile());
        }
        return scripts;
    }

    private createDependencyListSimpleModel(
        dependency: MapperTable, value: ValueTypeToParse, indexCascade: number, indexHeader: number
    ) {
        const modelBase = this.model();
        const modelDependency = {
            index: indexCascade,
            value,
        } as DependencyListSimpleModel;
        // Verificar se é Assigned a estrategia de Id, se for já adicionar como parametro
        if (this.mapperTable.keyColumns().length > 1) {
            throw new DatabaseBuilderError("Mapper with composite id not supported hasMany dependence");
        }
        const keyMapperBase = this.mapperTable.keyColumns()[0];
        switch (keyMapperBase.primaryKeyType) {
            case PrimaryKeyType.Assigned:
            case PrimaryKeyType.Guid:
                // TODO: considerar que será necessario obter a referencia do um array nos casos de insert batch
                modelDependency.reference = ModelUtils.get(Utils.isArray(modelBase) ? modelBase[indexHeader] : modelBase, keyMapperBase.fieldReference);
                if (modelDependency.reference === void 0) {
                    throw new DatabaseBuilderError(`Reference for dependency '${dependency.tableName}' of '${this.mapperTable.tableName}' couldn´t be obtained!`);
                }
                break;
            case PrimaryKeyType.AutoIncrement:
                modelDependency.reference = new ReplacementParam(`${indexHeader}`, "insertId");
                break;
            default:
                break;
        }
        return modelDependency;
    }

    protected resolveDependency(dependency: MapperTable): QueryCompiled {
        return void 0;
    }
}
