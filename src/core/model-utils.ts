import * as lodash from "lodash";
import { Utils } from "./utils";

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
            const isUndefined = lodash.isUndefined(objValue);
            const isEmpty = lodash.isEmpty(objValue);
            // const greatZero = Utils.isValueNumber(objValue as number > 0);
            // const lessZeroAndSrcGreatZero = (objValue as number <= 0 && srcValue as number > 0);
            const result = isUndefined || isEmpty
                ? srcValue
                : objValue;
            // const result = (!isUndefined || !isEmpty) && greatZero
            // const result = !isUndefined || !isEmpty || greatZero
            // ? objValue
            // : lessZeroAndSrcGreatZero
            //     ? srcValue
            //     : objValue;
            return result;
        });
        return result;
    }

    public static assignWith(obj: any, ...sources: any[]): any {
        return lodash.assignWith(obj, sources);
    }
}