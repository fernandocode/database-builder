const IDENTIFIER = '__identifier';

export class MapperUtils {

    public static resolveKey<T>(tKey: (new () => T) | T | string): string {
        // returns the string when string
        if (typeof tKey === 'string') return tKey;

        // when there's a prototype
        else if ('prototype' in tKey)
            return (
                // returns the identifier if defined
                tKey.prototype[IDENTIFIER] ??
                // or prototype name 
                tKey.prototype.name ??
                // or name itself in the last case 
                tKey.name
            );

        else
            return (
                // return the constructor's prototype identifier when defined
                tKey.constructor.prototype[IDENTIFIER] ??
                // or the constructor's name
                tKey.constructor.name
            );
    }

    public static setIdentifier<T>(newable: new () => T, identifier: string) {
        newable.prototype[IDENTIFIER] = identifier;
    }

}