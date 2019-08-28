import { QueryCompiled } from "./query-compiled";
import { Replaceable } from "./replaceable";
import { ParamType, Utils } from "./utils";

export class QueryHelper {

    public static compileWithoutParams(queryCompiled: QueryCompiled): string {
        return Replaceable.replaceArrayPattern(queryCompiled.query, "?", this.formatParamsToInline(queryCompiled.params));
    }

    private static formatParamsToInline(params: ParamType[]): any[] {
        return params.map(param => {
            return Utils.isString(param) || Utils.isBoolean(param)
                ? `'${param}'`
                : param as any;
        });
    }
}