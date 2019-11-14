import { Replaceable } from "./replaceable";
import { ParamType, Utils } from "./utils";

export class QueryHelper {

    public static compileWithoutParams(query: string, params: ParamType[]): string {
        return Replaceable.replaceArrayPattern(query, "?", this.formatParamsToInline(params));
    }

    public static splitMultipleCommands(sql: string, params: ParamType[]): Array<{ sql: string, params: ParamType[] }> {
        const sqls = this.getMultipleCommands(sql);
        return sqls.map(x => {
            const count = this.countOccurrence(x, "\\?");
            const r = { sql: x.trim(), params: params.splice(0, count) };
            // console.log(`split::: ${count} - `, r, x, params);
            return r;
        });
    }

    public static isMultipleCommands(statement: string): boolean {
        return this.getMultipleCommands(statement).length > 1;
    }

    private static getMultipleCommands(statement: string): string[] {
        return statement.split(";").filter(x => x.trim().length > 0);
    }

    private static countOccurrence(that: string, value: string): number {
        return (that.match(new RegExp(value, "g")) || []).length;
    }

    private static formatParamsToInline(params: ParamType[]): any[] {
        return params.map(param => {
            return Utils.isString(param) || Utils.isBoolean(param)
                ? `'${param}'`
                : param as any;
        });
    }
}