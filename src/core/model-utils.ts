import * as lodash from "lodash";

export class ModelUtils {

    public static set(model: any, property: string, keyValue: any): void {
        lodash.set(model, property, keyValue);
    }

    public static get(model: any, property: string): any {
        return lodash.get(model, property);
    }
}