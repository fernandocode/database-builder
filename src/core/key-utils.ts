import { MapperTable } from "./../mapper-table";
import { MapperColumn } from "../mapper-column";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { ModelUtils } from "./model-utils";
import { DatabaseResult } from "../definitions";

export class KeyUtils {

    public static setKey(mapperTable: MapperTable, model: any, keyValue: any): void {
        ModelUtils.set(model, this.primaryKeyMapper(mapperTable).fieldReference, keyValue);
    }

    public static getKey(mapperTable: MapperTable, model: any): any {
        return ModelUtils.get(model, this.primaryKeyMapper(mapperTable).fieldReference);
    }

    public static primaryKeyType(mapperTable: MapperTable): PrimaryKeyType {
        return this.primaryKeyMapper(mapperTable).primaryKeyType;
    }

    public static isCompositeKey(mapperTable: MapperTable): boolean {
        return this.primaryKeysMapper(mapperTable).length > 1;
    }

    public static primaryKeyMapper(mapperTable: MapperTable): MapperColumn {
        return this.primaryKeysMapper(mapperTable).find(_ => true);
    }

    public static primaryKeysMapper(mapperTable: MapperTable): MapperColumn[] {
        return mapperTable.columns.filter(x => !!x.primaryKeyType);
    }

    public static setKeyByResult<T>(models: Array<T>, result: DatabaseResult, mapper: MapperTable) {
        for (let index = 0; index < models.length; index++) {
            const model = models[index];
            if (KeyUtils.primaryKeyType(mapper) === PrimaryKeyType.AutoIncrement) {
                // calcule id by result
                const currentId = result.insertId - (result.rowsAffected - (index + 1))
                KeyUtils.setKey(mapper, model, currentId);
            } else {
                const keyValue = KeyUtils.getKey(mapper, model);
                try {
                    result.insertId = keyValue;
                } catch (error) {
                    // ignore error readonly property
                }
            }
        }
        return models;
    }

    public static transformerDatabaseResultInArray(databaseResult: DatabaseResult): Array<DatabaseResult> {
        const result: Array<DatabaseResult> = [];
        if (databaseResult) {
            for (let index = 0; index < databaseResult.rowsAffected; index++) {
                const currentId = databaseResult.insertId - (databaseResult.rowsAffected - (index + 1));
                result.push({
                    insertId: currentId
                } as DatabaseResult);
            }
        }
        return result;
    }
}