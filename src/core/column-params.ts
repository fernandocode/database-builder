import { ValueTypeToParse } from "./utils";
import { Resultable } from "./resultable";

export interface ColumnParams {
    column: string | Resultable;
    params: ValueTypeToParse[];
}
