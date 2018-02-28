import * as moment from "moment";
import { ValueTypeToParse } from "./utils";
import { WhereBuilder } from "./../crud/where-builder";
import { DatabaseHelper } from "./../database-helper";
import { ProjectionBuilder } from "./../crud/projection-builder";
import { Expression, ExpressionUtils, LambdaColumnMetadata, LambdaExpression } from "lambda-expression";
import { LambdaMetadata } from "./lambda-metadata";
import { ExpressionOrColumnEnum } from "./enums/expression-or-column-enum";
import { FieldType } from "./enums/field-type";
import { ColumnType } from "./enums/column-type";
import { ProjectionCompiled } from "../crud/projection-compiled";
import { Condition } from "../crud/enums/condition";

export type ValueType = number | string | boolean;
export type ValueTypeToParse = ValueType | moment.Moment | Date | object;

export type ExpressionOrColumn<T> = Expression<T> | string;

export type ProjectionOrValue<T> = ProjectionBuilder<T> | ValueTypeToParse;

export type ProjectionCompiledOrValue = ProjectionCompiled | ValueTypeToParse;

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

    public static isOnlyNumber(value: any): boolean {
        return /^[0-9]*$/.test(value);
    }

    public static isStartWithNumber(value: any): boolean {
        return /^[0-9]/.test(value);
    }

    public static isValueNumber(value: any): boolean {
        return this.isNumber(value) || this.isOnlyNumber(value);
    }

    public static isValueBoolean(value: any): boolean {
        return this.isBoolean(value) || this.isReservedBoolean(value);
    }

    public static isReservedBoolean(value: any): boolean {
        return value === "true" || value === "false";
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

    public static isProjectionCompiled<T>(projectionCandidate: any): boolean {
        return projectionCandidate instanceof ProjectionCompiled;
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
        return isNameColumn.test(column) && !this.isColumnReservedNameOrNotAllowed(column);
    }

    public static isValue(value: any): boolean {
        return !this.isNameColumn(value) &&
            (
                this.isValueNumber(value) || this.isString(value) || this.isValueBoolean(value)
                // this.isValueType(value)
                || this.isDate(value)
                || this.isMoment(value)
                // || this.isObject(value)
            );
    }

    public static normalizeSqlString(inputSql: string): string {
        return inputSql.replace(/\s+/g, " ").trim();
    }

    public static getLambdaMetadata<T>(expression: LambdaExpression<T>): LambdaMetadata {
        const columnMetadata = this.getLambdaColumnMetadata(expression);
        return {
            left: columnMetadata.columnLeft,
            condition: this.conditionSql(columnMetadata),
            right: columnMetadata.columnRight,
        } as LambdaMetadata;
    }

    public static clearParam(param: ValueTypeToParse): ValueTypeToParse {
        if (Utils.isString(param)) {
            if (Utils.isOnlyNumber(param)) {
                return +param;
            }
            if (Utils.isReservedBoolean(param)) {
                return param === "true";
            }
            // remove possiveis " ou ' (aspas duplas ou simples) no inicio ou fim de uma string de valor de parametro
            return (param as string).replace(/(^["']|["']$)/mg, "");
        }
        return param;
    }

    private static isColumnReservedNameOrNotAllowed(columnName: string): boolean {
        return this.isStartWithNumber(columnName) || this.isReservedBoolean(columnName);
    }

    private static getLambdaColumnMetadata<T>(expression: LambdaExpression<T>): LambdaColumnMetadata {
        return this.getExpressionUtils().getColumnByLambdaExpression(expression);
    }

    private static conditionSql(metadata: LambdaColumnMetadata): Condition[] {
        switch (metadata.operator) {
            case "==":
            case "===":
                if (this.isEquivalentNullExpression(metadata.columnRight)) {
                    return [Condition.IsNull];
                }
                return [Condition.Equal];
            case ">":
                return [Condition.Great];
            case ">=":
                return [Condition.GreatAndEqual];
            case "<":
                return [Condition.Less];
            case "<=":
                return [Condition.LessAndEqual];
            case "!":
                return [Condition.Not];
            case "!=":
            case "!==":
                if (this.isEquivalentNullExpression(metadata.columnRight)) {
                    return [Condition.Not, Condition.IsNull];
                }
                return [Condition.Not, Condition.Equal];
            case "XX":
                // TODO: not implemented
                return [Condition.Between];
            case "XXX":
                // TODO: not implemented
                return [Condition.In];
            // case '':
            // return Condition.
            default:
                throw new Error(`Not found condition (${metadata.operator})`);
        }
    }

    private static isEquivalentNullExpression(value: string): boolean {
        switch (value) {
            case "null":
            case "void 0":
            case "void":
            case "undefined":
            case "nil":
                return true;
            default:
                return false;
        }
    }

    private static getExpressionUtils(): ExpressionUtils {
        return this._expressionUtils = this._expressionUtils ? this._expressionUtils : new ExpressionUtils();
    }

    private static getDatabaseHelper(): DatabaseHelper {
        return this._databaseHelper = this._databaseHelper ? this._databaseHelper : new DatabaseHelper();
    }
}
