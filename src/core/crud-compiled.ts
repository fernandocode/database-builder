import { ValueType } from "./utils";

export interface CrudCompiled {
    sql: string;
    params: ValueType[];
}
