import { ModelUtils } from "./model-utils";
import { ExpressionOrColumn, Utils } from "./utils";

export class RowMapper<T> {

    private _valueResultMap: T;

    constructor(
        private _readable: {
            read: <TReader extends any>(
                typeT: new () => TReader,
                alias?: string
            ) => TReader
        }
    ) {
    }

    public map<TReader extends any>(
        typeT: new () => TReader,
        expression: ExpressionOrColumn<TReader, T>,
        alias: string = void 0
    ): RowMapper<T> {
        const expressionField = Utils.getColumn(expression, ".");
        const value: TReader = this._readable.read(typeT, alias);
        if (Utils.isNull(this._valueResultMap)) {
            this._valueResultMap = {} as T;
        }
        if (expressionField && expressionField.length > 0) {
            ModelUtils.update(this._valueResultMap, expressionField, (v) => ModelUtils.mergeOverrideEmpty(v, value));
        } else {
            this._valueResultMap = value as any;
        }
        return this;
    }

    public result(): T {
        return this._valueResultMap;
    }

}