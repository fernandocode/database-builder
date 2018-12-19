import * as lodash from "lodash";

export class ModelUtils {

    public static set(model: any, property: string, keyValue: any): any {
        return lodash.set(model, property, keyValue);
    }

    public static update(model: any, property: string, updateFn: (value: any) => any): any {
        return lodash.update(model, property, updateFn);
    }

    public static get(model: any, property: string): any {
        return lodash.get(model, property);
    }

    public static mergeOverrideEmpty(obj: any, sources: any): any {
        const result = lodash.assignWith(obj, sources, (objValue: any, srcValue: any) => {
            return !lodash.isUndefined(objValue) || !lodash.isEmpty(objValue) ? objValue : srcValue;
        });
        return result;
    }

    public static assignWith(obj: any, ...sources: any[]): any {
        return lodash.assignWith(obj, sources);
    }
}