import { ValueType} from "./utils";
import { FieldType } from "./enums/field-type";
import { PrimaryKeyType } from "./enums/primary-key-type";

export interface Column {
    value: ValueType;
    name: string;
    type: FieldType;
    // isKeyColumn?: boolean;
    // isAutoIncrement?: boolean;
    primaryKeyType?: PrimaryKeyType;
}
