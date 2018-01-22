import { MetadataTable } from "./../metadata-table";

export interface GetMapper {
    getMapper<T>(tKey: new () => T): MetadataTable<T>;
}
