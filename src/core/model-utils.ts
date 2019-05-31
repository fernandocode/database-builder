import * as lodash from "lodash";
import { Utils } from "./utils";

export class ModelUtils {

    public static set(model: any, property: string, keyValue: any): any {
        // verifica se é nulo/undefined
        if (Utils.isNull(keyValue)) {
            // se for nulo seta a valor na raiz da propriedade
            return lodash.set(model, property.split(".")[0], keyValue);
        }
        return lodash.set(model, property, keyValue);
    }

    public static update(model: any, property: string, updateFn: (value: any) => any): any {
        return lodash.update(model, property, updateFn);
    }

    public static get(model: any, property: string): any {
        return lodash.get(model, property);
    }

    public static mergeOverrideEmpty(obj: any, sources: any): any {
        const result = lodash.assignWith(obj, sources, (oldValue: any, newValue: any) => {
            const newIsUndefined = Utils.isNull(newValue);
            const oldIsUndefined = Utils.isNull(oldValue);
            // const newIsUndefined = lodash.isUndefined(newValue);
            // const oldIsUndefined = lodash.isUndefined(oldValue);
            const newIsNumber = Utils.isValueNumber(newValue);
            const oldIsNumber = Utils.isValueNumber(oldValue);
            const newIsEmpty = newIsNumber ? false : lodash.isEmpty(newValue);
            const oldIsEmpty = oldIsNumber ? false : lodash.isEmpty(oldValue);

            // const oldIsGreatZero = oldIsNumber ? oldValue as number > 0 : false;
            // const newIsGreatZero = Utils.isValueNumber(newValue) ? newValue as number > 0 : false;
            const oldIsValueDefault = Utils.isValueDefault(oldValue);
            // const oldIsNumberDefaultAndNewIsNumberValid = !oldIsGreatZero && newIsGreatZero;
            const useNewValue: boolean = (oldIsUndefined || oldIsEmpty) || (oldIsValueDefault && (!newIsUndefined || !newIsEmpty));
            // const useNewValue: boolean = (oldIsUndefined || oldIsEmpty) || (oldIsNumberDefaultAndNewIsNumberValid);
            const result = useNewValue
                ? newValue
                : oldValue;
            return result;
        });
        return result;
    }

    public static assignWith(obj: any, ...sources: any[]): any {
        return lodash.assignWith(obj, sources);
    }
}