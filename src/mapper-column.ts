import { FieldType } from "./core/enums/field-type";

export class MapperColumn {

    constructor(
        public column: string = void 0,
        public fieldType: FieldType = void 0,
        public fieldReference: string = column ? column.replace(/_/g, ".") : void 0) {

    }
}
