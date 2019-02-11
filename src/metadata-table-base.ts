import { MapperTable } from "./mapper-table";

export class MetadataTableBase<T> {
    public mapperTable: MapperTable;

    constructor(
        public newable: new () => T
    ){

    }
}