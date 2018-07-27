import { MapperTable } from "../mapper-table";
import { ExpressionOrColumn, Utils } from "./utils";
import { DatabaseHelper } from "..";
import { FieldType } from "./enums/field-type";

export class RowResult<T> {
    private _databaseHelper: DatabaseHelper;

    constructor(private _valueT: T, private _mapper?: MapperTable) {
        this._databaseHelper = new DatabaseHelper();
    }

    public parse<TReturn>(expression: ExpressionOrColumn<TReturn, T>, type: FieldType): TReturn {
        const value = Utils.getValue(this._valueT, expression);
        return this._databaseHelper.databaseToValue(value, type);
    }

    public autoParse<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        if (this._mapper) {
            const column = Utils.getColumn(expression);
            const value = Utils.getValue(this._valueT, column);
            return this._databaseHelper.databaseToValue(value, this._mapper.columns.find(x => x.column === column).fieldType);
        }
        // tslint:disable-next-line:no-console
        console.warn(`Auto parse not possible. (MapperTable not found)`);
        return this.get(expression);
    }

    public get<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return Utils.getValue(this._valueT, expression);
    }

    public coalesce<TReturn>(expression: ExpressionOrColumn<TReturn, T>, defaultValue: TReturn) {
        const value = this.get(expression);
        // tslint:disable-next-line:triple-equals
        return value == void 0 ? defaultValue : value;
    }
}
