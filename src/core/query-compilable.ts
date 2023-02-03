import { QueryCompiled } from "./query-compiled";

export interface QueryCompilable {
    compile(): QueryCompiled | QueryCompiled[];
}
