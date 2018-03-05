import { ValueType } from "./utils";
import { QueryCompiled } from ".";

export interface QueryCompilable {
    compile(): QueryCompiled;
}
