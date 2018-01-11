import { MetadataTable } from "../database-builder/metadata-table";

export interface IGetMapper {
    getMapper<T>(tKey: new () => T): MetadataTable<T>;
}