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
        const result = this.assignWith(obj, sources, this.mergeValues);
        return result;
    }

    public static mergeValues(oldValue: any, newValue: any) {
        const newIsUndefined = Utils.isNull(newValue);
        const oldIsUndefined = Utils.isNull(oldValue);
        const newIsNumber = Utils.isValueNumber(newValue);
        const oldIsNumber = Utils.isValueNumber(oldValue);
        const newIsEmpty = newIsNumber && !newIsUndefined ? false : Utils.isEmpty(newValue);
        const oldIsEmpty = oldIsNumber && !oldIsUndefined ? false : Utils.isEmpty(oldValue);

        const newIsValueDefault = Utils.isValueDefault(newValue);
        const oldIsValueDefault = Utils.isValueDefault(oldValue);

        const newValueScoreBad = (newIsUndefined && 3) + (newIsEmpty && 2) + (newIsValueDefault && 1);
        const oldValueScoreBad = (oldIsUndefined && 3) + (oldIsEmpty && 2) + (oldIsValueDefault && 1);
        const newValueIsGood = !newIsUndefined && !newIsEmpty && !newIsValueDefault;

        const useNewValue: boolean =
            (oldIsValueDefault && (!newIsUndefined || !newIsEmpty)) ||
            (newValueScoreBad <= oldValueScoreBad);
        const result = useNewValue
            ? newValue
            : oldValue;
        return result;
    }

    public static assignWith(obj: any, ...sources: any[]): any {
        return lodash.assignWith(obj, ...sources);
    }

    public static cloneDeep<T>(obj: T): T {
        return lodash.cloneDeep<T>(obj);
    }
}