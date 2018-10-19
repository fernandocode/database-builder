import { QueryCompiled } from "../core/query-compiled";

export interface SqlCompilable {
    compile(): QueryCompiled[];
}