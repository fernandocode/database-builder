import { Utils } from "./../core/utils";
import { DatabaseBuilderError, DatabaseHelper, GetMapper, MetadataTable } from "..";
import { MapperSettingsModel } from "./mapper-settings-model";
import { Expression } from "lambda-expression";

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

    // public mapper(
    //     readOnly?: boolean,
    //     settings: MapperSettingsModel = this._defaultSettings,
    //     ...defaultsMapper: Array<new () => any>
    // ): MapperBase {
    //     defaultsMapper.forEach(mapper => {
    //         this.add(mapper, readOnly, settings);
    //     });
    //     return this;
    // }

    /**
     * Added mapper for column
     * @param newable Type Model
     * @param keyColumn Expression primary key
     * @param isAutoIncrement If primary key is autoincrement, default 'false'
     * @param readOnly if column is readonly, default 'false'
     * @param settings settings mapper, default settings construtor
     */
    public add<T>(
        newable: new () => T,
        keyColumn: Expression<T>,
        isAutoIncrement?: boolean,
        readOnly?: boolean,
        settings: MapperSettingsModel = this._defaultSettings,
        // advancedMapper: (metadata: MetadataTable<T>) => void = void 0
    ): MetadataTable<T> {
        // ): MapperBase {
        const metadata = new MetadataTable(newable, this._databaseHelper, this, readOnly)
            .key(keyColumn, isAutoIncrement)
            .autoMapper(
                settings.references,
                settings.referencesId,
                settings.referencesIdRecursive
            );
        // if (advancedMapper) {
        //     advancedMapper(metadata);
        // }
        this.push(metadata);
        return metadata;
        // return this;
    }

    public has<T>(tKey: (new () => T) | string): boolean {
        return this._mappers.has(this.resolveKey(tKey));
    }

    public get<T>(tKey: (new () => T) | string): MetadataTable<T> {
        return this._mappers.get(
            this.resolveKey(tKey)
        );
    }

    public getThrowErrorNotFound<T>(tKey: (new () => T) | string): MetadataTable<T> {
        if (!this.has(tKey)) {
            throw new DatabaseBuilderError(`Mapper not found for '${this.resolveKey(tKey)}'`);
        }
        return this.get(tKey);
    }

    public forEachMapper(
        callbackfn: (value: MetadataTable<any>, key: string, map: Map<string, MetadataTable<any>>) => void,
        thisArg?: any
    ): void {
        this._mappers.forEach(callbackfn);
    }

    private push(metadataTable: MetadataTable<any>): void {
        this._mappers.set(metadataTable.instance.constructor.name, metadataTable);
    }

    private resolveKey<T>(tKey: (new () => T) | string): string {
        return Utils.isString(tKey)
            ? tKey as string
            : (tKey as (new () => T)).name;
    }
}
