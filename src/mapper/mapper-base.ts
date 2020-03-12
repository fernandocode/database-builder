import { PrimaryKeyType } from "./../core/enums/primary-key-type";
import { MapperSettingsModel } from "./mapper-settings-model";
import { Expression, ReturnExpression } from "lambda-expression";
import { GetMapper } from "./interface-get-mapper";
import { MetadataTable } from "../metadata-table";
import { DatabaseHelper } from "../database-helper";
import { DatabaseBuilderError } from "../core/errors";
import { MapperUtils } from "./mapper-utils";

export class MapperBase implements GetMapper {

    private _mappers: Map<string, MetadataTable<any>> = new Map<string, MetadataTable<any>>();

    constructor(
        private _databaseHelper: DatabaseHelper,
        protected _defaultSettings: MapperSettingsModel =
            {
                references: false,
                referencesId: true,
                referencesIdRecursive: false
            }
    ) {
    }

    /**
     * Auto Mapper Table for Model, primary key and all column initialized in model class
     * @param newable Type Model
     * @param keyColumn Expression primary key
     * @param isAutoIncrement If primary key is autoincrement, default 'false'
     * @param readOnly if column is readonly, default 'false'
     * @param settings settings mapper, default settings construtor
     */
    public autoMapper<TReturn, T>(
        newable: new () => T,
        keyColumn: ReturnExpression<TReturn, T>,
        primaryKeyType?: PrimaryKeyType,
        keyType?: new () => TReturn,
        readOnly?: boolean,
        settings: MapperSettingsModel = this._defaultSettings
    ): MetadataTable<T> {
        const metadata = new MetadataTable(newable, this._databaseHelper, this, readOnly)
            .key(keyColumn, primaryKeyType, keyType)
            .autoMapper(
                settings.references,
                settings.referencesId,
                settings.referencesIdRecursive
            );
        this.push(metadata);
        return metadata;
    }

    /**
     * Mapper Table for Model
     * @param newable Type Model
     * @param readOnly if column is readonly, default 'false'
     */
    public mapper<T>(
        newable: new () => T,
        readOnly?: boolean
    ): MetadataTable<T> {
        const metadata = new MetadataTable(newable, this._databaseHelper, this, readOnly);
        this.push(metadata);
        return metadata;
    }

    public has<T>(tKey: (new () => T) | string): boolean {
        return this._mappers.has(MapperUtils.resolveKey(tKey));
    }

    public get<T>(tKey: (new () => T) | string): MetadataTable<T> {
        return this._mappers.get(
            MapperUtils.resolveKey(tKey)
        );
    }

    public getThrowErrorNotFound<T>(tKey: (new () => T) | string): MetadataTable<T> {
        if (!this.has(tKey)) {
            throw new DatabaseBuilderError(`Mapper not found for '${MapperUtils.resolveKey(tKey)}'`);
        }
        return this.get(tKey);
    }

    public forEachMapper(
        callbackfn: (value: MetadataTable<any>, key: string, map: Map<string, MetadataTable<any>>) => void,
        thisArg?: any
    ): void {
        this._mappers.forEach(callbackfn);
    }

    public clear() {
        this._mappers = new Map<string, MetadataTable<any>>();
    }

    private push(metadataTable: MetadataTable<any>): void {
        if (this.has(metadataTable.newable.name)) {
            throw new DatabaseBuilderError(`Duplicate mapper: '${metadataTable.newable.name}'`);
        }
        this._mappers.set(metadataTable.newable.name, metadataTable);
    }
}
