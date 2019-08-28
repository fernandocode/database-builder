
export class Replaceable {

    public static replaceAt(base: string, index: number, replace: string) {
        return index > -1
            ? base.substring(0, index) + replace + base.substring(index + 1)
            : base;
    }

    public static replaceArrayPattern(base: string, searchValue: string, replaceArray: string[]) {
        replaceArray.forEach(replace => {
            base = this.replaceAt(base, base.indexOf(searchValue), replace);
        });
        return base;
    }
}