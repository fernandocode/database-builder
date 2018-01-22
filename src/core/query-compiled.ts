import { ValueType } from "./utils";

export interface QueryCompiled {
    query: string;
    params: ValueType[];
}
