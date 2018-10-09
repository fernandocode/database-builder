import { ParamType } from "../core/utils";

export interface WhereCompiled {
    where: string;
    params: ParamType[];
}
