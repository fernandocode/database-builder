import { QueryCompiled } from "./query-compiled";

export interface DdlCompiled {
    script: QueryCompiled;
    dependencies: DdlCompiled[];
}