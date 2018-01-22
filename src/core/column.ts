import { ValueType} from "./utils";
import { FieldType } from "./enums/field-type";

export interface Column {
    value: ValueType;
    name: string;
    type: FieldType;
}
