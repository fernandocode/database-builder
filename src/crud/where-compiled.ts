import { ValueType } from "../core/utils";

export interface WhereCompiled {
    where: string;
    params: ValueType[];
}
