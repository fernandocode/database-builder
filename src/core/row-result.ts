import { ExpressionOrColumn, Utils } from "./utils";

export class RowResult<T> {

    constructor(private _valueT: T) {

    }

    public get(expression: ExpressionOrColumn<T>): any {
        return Utils.getValue(this._valueT, expression);
    }

    public coalesce(expression: ExpressionOrColumn<T>, defaultValue: any) {
        const value = this.get(expression);
        // tslint:disable-next-line:triple-equals
        return value == void 0 ? defaultValue : value;
    }
}
