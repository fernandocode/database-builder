import { MapperTable } from "./../mapper-table";
import { MapperColumn } from "../mapper-column";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { ModelUtils } from "./model-utils";

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
}