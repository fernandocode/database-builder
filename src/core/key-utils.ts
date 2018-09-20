import { MapperColumn } from "../mapper-column";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { Utils } from "./utils";
import * as lodash from "lodash";
import { MetadataTable } from "../metadata-table";

export class KeyUtils {

    public static setKey<T>(metadata: MetadataTable<T>, model: any, keyValue: any): void {
        // model[this.primaryKeyMapper(metadata).fieldReference] = keyValue;
        lodash.set(model, this.primaryKeyMapper(metadata).fieldReference, keyValue);
    }

    public static getKey<T>(metadata: MetadataTable<T>, model: any): any {
        return Utils.getValue(model, this.primaryKeyMapper(metadata).fieldReference);
    }

    public static primaryKeyType<T>(metadata: MetadataTable<T>): PrimaryKeyType {
        return this.primaryKeyMapper(metadata).primaryKeyType;
    }

    public static isCompositeKey<T>(metadata: MetadataTable<T>): boolean {
        return this.primaryKeysMapper(metadata).length > 1;
    }

    public static primaryKeyMapper<T>(metadata: MetadataTable<T>): MapperColumn {
        return this.primaryKeysMapper(metadata).find(_ => true);
    }

    public static primaryKeysMapper<T>(metadata: MetadataTable<T>): MapperColumn[] {
        return metadata.mapperTable.columns.filter(x => !!x.primaryKeyType);
    }
}