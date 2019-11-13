import { Replaceable } from "./replaceable";
import { ParamType, Utils } from "./utils";

export class QueryHelper {

    public static compileWithoutParams(query: string, params: ParamType[]): string {
        return Replaceable.replaceArrayPattern(query, "?", this.formatParamsToInline(params));
    }

    private static formatParamsToInline(params: ParamType[]): any[] {
        return params.map(param => {
            return Utils.isString(param) || Utils.isBoolean(param)
                ? `'${param}'`
                : param as any;
        });
    }
}