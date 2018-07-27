export class BaseKey implements IBaseKey {
    public internalKey: number = 0;
}

// tslint:disable-next-line:interface-name
export interface IBaseKey {
    internalKey: number;
}
