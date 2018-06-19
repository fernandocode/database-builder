import { QueryCompiled } from ".";

export interface QueryCompilable {
    compile(): QueryCompiled;
}
