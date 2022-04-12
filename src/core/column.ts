import { ValueType} from "./utils";
import { FieldType } from "./enums/field-type";
import { PrimaryKeyType } from "./enums/primary-key-type";

export interface Column {
    value: Array<ValueType>;
    name: string;
    type: FieldType;
    primaryKeyType?: PrimaryKeyType;
}
