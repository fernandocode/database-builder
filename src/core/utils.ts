import { WhereBuilder } from "./../crud/where-builder";
import { DatabaseHelper } from "./../database-helper";
import { ProjectionBuilder } from "./../crud/projection-builder";
import { Expression, ExpressionUtils } from "lambda-expression";
import * as moment from "moment";
import { ExpressionOrColumnEnum } from "./enums/expression-or-column-enum";
import { FieldType } from "./enums/field-type";
import { ColumnType } from "./enums/column-type";

export type ValueType = number | string | boolean;
export type ValueTypeToParse = ValueType | moment.Moment | Date | object;

export type ExpressionOrColumn<T> = Expression<T> | string;

export type ProjectionOrValue<T> = ProjectionBuilder<T> | ValueTypeToParse;

export class Utils {

    private static _expressionUtils: ExpressionUtils;
    private static _databaseHelper: DatabaseHelper;

    public static is(value: any, type: string): boolean {
        return typeof value === type;
    }

    public static isString(value: any): boolean {
        return this.is(value, "string");
    }

    public static isObject(value: any): boolean {
        return this.is(value, "object");
    }

    public static isNumber(value: any): boolean {
        return this.is(value, "number");
    }

    public static isBoolean(value: any): boolean {
        return this.is(value, "boolean");
    }

    public static isFunction(value: any): boolean {
        return this.is(value, "function");
    }

    public static isDate(value: any): boolean {
        return value instanceof Date;
    }

    public static isMoment(value: any): boolean {
        return moment.isMoment(value);
    }

    public static isProjectionBuilder<T>(projectionCandidate: any): boolean {
        return projectionCandidate instanceof ProjectionBuilder;
    }

    public static isValueType<T>(value: ValueType): boolean {
        return this.isNumber(value) || this.isString(value) || this.isBoolean(value);
    }

    public static isValueTypeToParse<T>(value: any): boolean {
        return this.isValueType(value) || this.isDate(value) || this.isMoment(value) || this.isObject(value);
    }

    public static isWhereBuilder<T>(whereCandidate: any): boolean {
        return whereCandidate instanceof WhereBuilder;
    }

    public static expressionOrColumn<T>(value: ExpressionOrColumn<T>): ExpressionOrColumnEnum {
        return this.isString(value) ? ExpressionOrColumnEnum.Column : ExpressionOrColumnEnum.Expression;
    }

    public static getColumn<T>(expression: ExpressionOrColumn<T>): string {
        return this.expressionOrColumn(expression) === ExpressionOrColumnEnum.Expression
            ? this.getExpressionUtils().getColumnByExpression(expression as Expression<T>)
            : expression as string;
    }

    public static getValue<T>(instance: any, expression: ExpressionOrColumn<T>): string {
        return this.expressionOrColumn(expression) === ExpressionOrColumnEnum.Expression
            ? this.getExpressionUtils().getValueByExpression(instance, expression as Expression<T>)
            : this.getExpressionUtils().getValue(instance, expression as string);
    }

    public static getTypeByValue(value: ValueTypeToParse): FieldType {
        return this.getDatabaseHelper().getType(value);
    }

    public static getType(instance: ValueTypeToParse): FieldType;
    public static getType<T>(instance: any, expression: ExpressionOrColumn<T>): FieldType;
    public static getType<T>(instance: any, expression?: ExpressionOrColumn<T>): FieldType {
        if (expression) {
            return this.getTypeByValue(this.getValue(instance, expression));
        }
        return this.getTypeByValue(instance);
    }

    public static getValueType(value: ValueTypeToParse, type: FieldType = void 0): ValueType {
        return this.getDatabaseHelper().parseToValueType(value, type);
    }

    public static parseColumnType(type: FieldType): ColumnType {
        return this.getDatabaseHelper().parseToColumnType(type);
    }

    public static isNameColumn(column: string): boolean {
        const isNameColumn = /^[a-zA-Z0-9_\*]*$/;
        return isNameColumn.test(column);
    }

    private static getExpressionUtils(): ExpressionUtils {
        return this._expressionUtils = this._expressionUtils ? this._expressionUtils : new ExpressionUtils();
    }

    private static getDatabaseHelper(): DatabaseHelper {
        return this._databaseHelper = this._databaseHelper ? this._databaseHelper : new DatabaseHelper();
    }
}
