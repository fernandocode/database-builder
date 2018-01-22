import { ValueType } from "./utils";

export interface QueryCompilable {
    compile(): { query: string, params: ValueType[] };
}
