import { MetadataTable } from "./../metadata-table";

export interface GetMapper {

    getMapper<T>(tKey: new () => T): MetadataTable<T>;

    forEachMapper(
        callbackfn: (
            value: MetadataTable<any>,
            key: string,
            map: Map<string, MetadataTable<any>>
        ) => void,
        thisArg?: any
    ): void;
}
