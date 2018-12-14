import { Utils } from "../core/utils";

export class MapperUtils {

    public static resolveKey<T>(tKey: (new () => T) | string): string {
        return Utils.isString(tKey)
            ? tKey as string
            : (tKey as (new () => T)).name;
    }
}