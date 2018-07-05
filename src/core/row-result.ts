import { ExpressionOrColumn, Utils } from "./utils";

export class RowResult<T> {

    constructor(private _valueT: T) {

    }

    public get<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return Utils.getValue(this._valueT, expression);
    }

    public coalesce<TReturn>(expression: ExpressionOrColumn<TReturn, T>, defaultValue: TReturn) {
        const value = this.get(expression);
        // tslint:disable-next-line:triple-equals
        return value == void 0 ? defaultValue : value;
    }

    // public coalesceTTT<R>(expression: ExpressionOrColumnTTT<T, R>, defaultValue: R) {
    //     const value = this.get(expression);
    //     // tslint:disable-next-line:triple-equals
    //     return value == void 0 ? defaultValue : value;
    // }
}
