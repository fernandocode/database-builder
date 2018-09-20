
export class GuidClazz {
    get guid(): string {
        return this._guid;
    }
    set guid(theBar: string) {
        this._guid = theBar;
    }

    constructor(
        public _guid?: string,
        public description?: string
    ) {

    }
}
