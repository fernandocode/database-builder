import { ParamType } from "./utils";

export interface QueryCompiled {
    query: string;
    params: ParamType[];
}
