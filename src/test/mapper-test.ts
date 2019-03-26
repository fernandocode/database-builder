import { MapperBase, DatabaseHelper, MetadataTable, MapperSettingsModel } from "..";
import { BaseModel } from "./models/base-model";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { ReturnExpression } from "lambda-expression";
import { BaseImport } from "./models/base-import";

export class MapperTest extends MapperBase {

    constructor() {
        super(
            new DatabaseHelper(),
            {
                references: false,
                referencesId: true,
                referencesIdRecursive: false
            });
    }

    public autoMapperIdErp<TKey, T extends BaseModel<TKey>>(
        newable: new () => T,
        type: new () => TKey,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean
    ): MetadataTable<T> {
        return this.autoMapperBase(
            this.mapper(newable, readOnly)
                .column(x => x.codeImport, type)
            ,
            x => x.internalKey, primaryKeyType, Number
        );
    }

    public autoMapperIdImport<TKey, T extends BaseImport<TKey>>(
        newable: new () => T,
        type: new () => TKey,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean
    ): MetadataTable<T> {
        return this.autoMapperBase(
            this.mapper(newable, readOnly),
            x => x.codeImport, primaryKeyType, type
        );
    }

    private autoMapperBase<T, TReturn>(
        metadata: MetadataTable<T>,
        keyColumn: ReturnExpression<TReturn, T>,
        primaryKeyType: PrimaryKeyType,
        type: new () => TReturn,
        settings: MapperSettingsModel = this._defaultSettings
    ): MetadataTable<T> {
        return metadata
            .key(keyColumn, primaryKeyType, type)
            .autoMapper(
                settings.references,
                settings.referencesId,
                settings.referencesIdRecursive
            );
    }
}