import { MetadataTable } from './../metadata-table';

export interface IGetMapper {
    getMapper<T>(tKey: new () => T): MetadataTable<T>;
}