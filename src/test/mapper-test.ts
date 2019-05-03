import { DatabaseHelper, MapperBase, MapperSettingsModel, MetadataTable } from "..";
import { BaseModel } from "./models/base-model";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { ReturnExpression } from "lambda-expression";
import { BaseImport } from "./models/base-import";
import { IBaseKey } from "./models/base-key";
import { BaseModelAuditoria } from "./models/base/base-model-auditoria";
import { BaseModelErp } from "./models/base/base-model-erp";
import { BaseModelId } from "./models/base/base-model-id";
import { BaseModelMeio } from "./models/base/base-model-meio";

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

    public autoMapperModelInternalKey<TKey, T extends BaseModel<TKey>>(
        newable: new () => T,
        type: new () => TKey,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean
    ): MetadataTable<T> {
        return this.autoMapperBaseOld(
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
        return this.autoMapperBaseOld(
            this.mapper(newable, readOnly),
            x => x.codeImport, primaryKeyType, type
        );
    }

    public autoMapperKey<T extends IBaseKey>(
        newable: new () => T,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean,
        settings?: MapperSettingsModel
    ): MetadataTable<T> {
        return this.autoMapperBaseOld(
            this.mapper(newable, readOnly),
            x => x.internalKey, primaryKeyType,
            Number,
            settings
        );
    }

    public autoMapperBaseOld<T, TReturn>(
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

    public autoMapperIdErp<T extends BaseModelErp>(
        newable: new () => T,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean
    ): MetadataTable<T> {
        return this.autoMapperBase(
            this.mapperAuditoria(this.mapper(newable, readOnly)),
            x => x.idErp,
            primaryKeyType,
            Number
        );
    }

    public autoMapperId<T extends BaseModelId>(
        newable: new () => T,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean
    ): MetadataTable<T> {
        return this.autoMapperBase(
            this.mapperIdErp(this.mapper(newable, readOnly)),
            x => x.id,
            primaryKeyType,
            String
        ).column(x => x.change, Boolean);
    }

    public autoMapperIdMeio<T extends BaseModelMeio>(
        newable: new () => T,
        primaryKeyType?: PrimaryKeyType,
        readOnly?: boolean
    ): MetadataTable<T> {
        return this.autoMapperBase(
            this.mapperAuditoria(this.mapper(newable, readOnly)),
            x => x.idMeio,
            primaryKeyType,
            Number
        );
    }

    // public autoMapperIdBase<T extends BaseModel>(
    //     newable: new () => T,
    //     primaryKeyType?: PrimaryKeyType,
    //     readOnly?: boolean
    // ): MetadataTable<T> {
    //     return this.autoMapperBase(this.mapper(newable, readOnly), x => x.id, primaryKeyType, Number);
    // }

    public autoMapperBase<T, TReturn>(
        metadata: MetadataTable<T>,
        keyColumn: ReturnExpression<TReturn, T>,
        primaryKeyType: PrimaryKeyType,
        type: new () => TReturn,
        settings: MapperSettingsModel = this._defaultSettings
    ): MetadataTable<T> {
        return metadata
            .key(keyColumn, primaryKeyType, type)
            .autoMapper(settings.references, settings.referencesId, settings.referencesIdRecursive);
    }

    public mapperId<T extends BaseModelId>(metadata: MetadataTable<T>): MetadataTable<T> {
        return this.mapperIdErp(metadata.column(x => x.id, String).column(x => x.change, Boolean));
    }

    public mapperIdMeio<T extends BaseModelMeio>(metadata: MetadataTable<T>): MetadataTable<T> {
        return this.mapperAuditoria(metadata.column(x => x.idMeio, Number));
    }

    public mapperIdErp<T extends BaseModelErp>(metadata: MetadataTable<T>): MetadataTable<T> {
        return this.mapperAuditoria(metadata.column(x => x.idErp, Number));
    }

    // public mapperIdBase<T extends BaseModel>(metadata: MetadataTable<T>): MetadataTable<T> {
    //     return metadata.column(x => x.id, Number);
    // }

    public mapperAuditoria<T extends BaseModelAuditoria>(metadata: MetadataTable<T>): MetadataTable<T> {
        return metadata.column(x => x.versao, Number);
        // .column(x => x.deleted, Boolean);
    }
}