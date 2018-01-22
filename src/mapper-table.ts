import { MapperColumn } from "./mapper-column";

export class MapperTable {

    public columns: MapperColumn[] = [];

    constructor(
        public tableName: string = void 0,
    ) {

    }

}
