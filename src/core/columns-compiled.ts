import { ValueType } from "./utils";
import { ColumnsBaseCompiled } from "./columns-base-compiled";

export interface ColumnsCompiled extends ColumnsBaseCompiled {
    params: Array<ValueType[]>;
}
