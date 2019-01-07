import { ExpressionOrValueEnum } from "./enums/expression-or-value-enum";
import * as moment from "moment";
import { ValueTypeToParse } from "./utils";
import { WhereBuilder } from "../crud/where-builder";
import { DatabaseHelper } from "../database-helper";
import { ProjectionBuilder } from "../crud/projection-builder";
import { Expression, ExpressionUtils, LambdaColumnMetadata, LambdaExpression, ReturnExpression } from "lambda-expression";
import { LambdaMetadata } from "./lambda-metadata";
import { ExpressionOrColumnEnum } from "./enums/expression-or-column-enum";
import { FieldType } from "./enums/field-type";
import { ColumnType } from "./enums/column-type";
import { ProjectionCompiled } from "../crud/projection-compiled";
import { Condition } from "../crud/enums/condition";
import { DatabaseBuilderError } from "./errors";
import { ProjectionsHelper } from "./projections-helper";
import { ColumnParams } from "./column-params";
import { ColumnRef } from "./column-ref";
import { PlanRef } from "./plan-ref";
import * as uuidv4 from "uuid/v4";
import { ReplacementParam } from "./replacement-param";

export type ParamType = ValueType | ReplacementParam;

export type ValueType = number | string | boolean;
export type ValueTypeToParse = ValueType | moment.Moment | Date | object;

export type TypeOrString<T> = (new () => T) | string;

export type ExpressionOrColumn<TReturn, T> = ReturnExpression<TReturn, T> | string;

export type TypeWhere<T> = Expression<T> | ValueTypeToParse | ColumnRef | ProjectionsHelper<T> | PlanRef;

export type TypeProjection<T> = ProjectionsHelper<T> | ColumnRef | PlanRef;

export type ExpressionProjection<TReturn, T> = TypeProjection<T> | ExpressionOrColumn<TReturn, T>;

export type ProjectionOrValue<T> = ProjectionBuilder<T> | ProjectionsHelper<T> | ValueTypeToParse;

export class Utils {

    private static _expressionUtils: ExpressionUtils;
    private static _databaseHelper: DatabaseHelper;

    // Fonte: https://www.npmjs.com/package/uuid
    public static GUID() {
        return uuidv4();
    }

    public static isFlag(value: any, flag: any) {
        return this.getDatabaseHelper().isFlag(value, flag);
    }

    public static is(value: any, type: string): boolean {
        return typeof value === type;
    }

    public static isArray(value: any): boolean {
        return Array.isArray(value);
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
        return value && value.length && /^[0-9]*$/.test(value);
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

    public static isProjectionBuilder(projectionCandidate: any): boolean {
        return projectionCandidate instanceof ProjectionBuilder;
    }

    public static isProjectionCompiled(projectionCandidate: any): boolean {
        return projectionCandidate instanceof ProjectionCompiled;
    }

    public static isProjectionsHelper(projectionCandidate: any): boolean {
        return projectionCandidate instanceof ProjectionsHelper;
    }

    public static isValueType(value: ValueType): boolean {
        return this.isNumber(value) || this.isString(value) || this.isBoolean(value);
    }

    public static isValueTypeToParse(value: any): boolean {
        return this.isValueType(value) || this.isDate(value) || this.isMoment(value) || this.isObject(value);
    }

    public static isWhereBuilder(whereCandidate: any): boolean {
        return whereCandidate instanceof WhereBuilder;
    }

    public static isColumnRef(instance: any): boolean {
        return instance instanceof ColumnRef;
    }

    public static isPlanRef(instance: any): boolean {
        return instance instanceof PlanRef;
    }

    public static expressionOrColumn<TReturn, T>(
        value: ExpressionOrColumn<TReturn, T>
    ): ExpressionOrColumnEnum {
        return this.isString(value)
            ? ExpressionOrColumnEnum.Column
            : ExpressionOrColumnEnum.Expression;
    }

    public static expressionOrValue<T>(
        value: TypeWhere<T>
    ): ExpressionOrValueEnum {
        return value === void 0
            ? ExpressionOrValueEnum.Null
            : this.isProjectionsHelper(value)
                ? ExpressionOrValueEnum.Projection
                : this.isColumnRef(value)
                    ? ExpressionOrValueEnum.Ref
                    : this.isPlanRef(value)
                        ? ExpressionOrValueEnum.Plan
                        : this.isValue(value)
                            ? ExpressionOrValueEnum.Value
                            : ExpressionOrValueEnum.Expression;
    }

    public static getValueByTypeOrString<T>(param: TypeOrString<T>): string {
        return this.isString(param) ? param as string : (param as (new () => T)).name;
    }

    public static getColumn<TReturn, T>(expression: ExpressionOrColumn<TReturn, T>, separator?: string): string {
        const type = this.expressionOrColumn(expression);
        switch (type) {
            case (ExpressionOrColumnEnum.Expression):
                return this.getExpressionUtils().getColumnByExpression(expression as Expression<T>, separator);
            case (ExpressionOrColumnEnum.Column):
                return expression as string;
        }
    }

    public static getColumnWhere<T>(expression: TypeWhere<T>): ColumnParams {
        const type = this.expressionOrValue(expression);
        switch (type) {
            case (ExpressionOrValueEnum.Expression):
                return {
                    column: this.getExpressionUtils().getColumnByExpression(expression as Expression<T>),
                    params: []
                };
            case (ExpressionOrValueEnum.Ref):
                return {
                    column: (expression as ColumnRef).result(),
                    params: []
                };
            case (ExpressionOrValueEnum.Plan):
                return {
                    column: (expression as PlanRef).result(),
                    params: []
                };
            case (ExpressionOrValueEnum.Value):
                return {
                    column: "?",
                    params: [expression]
                };
            case (ExpressionOrValueEnum.Projection):
                const compiled = this.resolveExpressionProjection(expression as ProjectionsHelper<T>);
                return {
                    column: compiled.projection,
                    params: compiled.params
                };
            case (ExpressionOrValueEnum.Null):
                return {
                    column: Condition.IsNull,
                    params: []
                };
        }
    }

    public static resolveExpressionProjection<TReturn, T>(projection: ExpressionProjection<TReturn, T>): ProjectionCompiled {
        if (this.isProjectionsHelper(projection)) {
            return (projection as ProjectionsHelper<T>)._compiled();
        }
        if (this.isColumnRef(projection)) {
            return new ProjectionCompiled((projection as ColumnRef).result());
        }
        if (this.isPlanRef(projection)) {
            return new ProjectionCompiled((projection as PlanRef).result());
        }
        return new ProjectionCompiled(this.getColumn(projection as ExpressionOrColumn<TReturn, T>));
    }

    public static getFieldExpression<T>(expression: Expression<T>): string {
        return this.getExpressionUtils().getColumnByExpression(expression, ".");
    }

    public static getValue<TReturn, T>(instance: any, expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return this.expressionOrColumn(expression) === ExpressionOrColumnEnum.Expression
            ? this.getExpressionUtils().getValueByExpression(instance, expression as Expression<T>)
            : this.getExpressionUtils().getValue(instance, expression as string);
    }

    public static getTypeByValue(value: ValueTypeToParse): FieldType {
        return this.getDatabaseHelper().getType(value);
    }

    public static getType(instance: ValueTypeToParse): FieldType;
    public static getType<TReturn extends ValueTypeToParse, T>(instance: any, expression: ExpressionOrColumn<TReturn, T>): FieldType;
    public static getType<TReturn extends ValueTypeToParse, T>(instance: any, expression?: ExpressionOrColumn<TReturn, T>): FieldType {
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
        return this.isValueNumber(value)
            || this.isString(value)
            || this.isValueBoolean(value)
            || this.isDate(value)
            || this.isMoment(value);
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

    public static addAlias(
        column: string, alias: string
    ): string {
        if (column && alias && Utils.isNameColumn(column)) {
            return `${alias}.${column}`;
        }
        return column;
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
                throw new DatabaseBuilderError(`Not found condition (${metadata.operator})`);
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
