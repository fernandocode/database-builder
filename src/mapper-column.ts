import { FieldType } from "./core/enums/field-type";
import { PrimaryKeyType } from "./core/enums/primary-key-type";

export class MapperColumn {

    constructor(
        public column: string = void 0,
        public fieldType: FieldType = void 0,
        public fieldReference: string = column ? column.replace(/_/g, ".") : void 0,
        public primaryKeyType?: PrimaryKeyType
    ) {

    }
}
