import { ParamType } from "./utils";

export interface CrudCompiled {
    sql: string;
    params: ParamType[];
}
