import { DatabaseHelper } from "./../database-helper";
import { LambdaExpression } from "lambda-expression";
import { ExpressionOrColumn, Utils, ValueType, ValueTypeToParse } from "./../core/utils";
import { QueryCompilable } from "../core/query-compilable";
import { WhereCompiled } from "./where-compiled";
import { Condition } from "./enums/condition";
import { LambdaMetadata } from "../core/lambda-metadata";
import { DatabaseBuilderError } from "../core/errors";

export interface WhereBaseBuilderContract<T, TExpression, TWhere extends WhereBaseBuilderContract<T, TExpression, TWhere>> {

    not(): TWhere;

    and(): TWhere;

    or(): TWhere;

    scope(
        scopeCallback: (scope: TWhere) => void,
    ): TWhere;

    /**
     * @deprecated Use `equal`
     * @param expression
     * @param column
     */
    equalColumn(
        expression: TExpression,
        column: string,
    ): TWhere;

    equalValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere;

    equal(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere;

    likeValue(
        expression: TExpression,
        value: string,
    ): TWhere;

    like(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere;

    containsValue(
        expression: TExpression,
        value: string
    ): TWhere;

    startsWithValue(
        expression: TExpression,
        value: string,
    ): TWhere;

    endsWithValue(
        expression: TExpression,
        value: string,
    ): TWhere;

    isNull(
        expression1: TExpression,
    ): TWhere;

    greatValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere;

    great(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere;

    greatAndEqualValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere;

    greatAndEqual(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere;

    lessValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere;

    less(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere;

    lessAndEqualValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere;

    lessAndEqual(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere;

    betweenValue(
        expression: TExpression,
        value1: ValueTypeToParse,
        value2: ValueTypeToParse,
    ): TWhere;

    inValues(
        expression: TExpression,
        values: ValueTypeToParse[],
    ): TWhere;

    inSelect(
        expression: TExpression,
        query: QueryCompilable,
    ): TWhere;

    compile(): WhereCompiled;

    expression(expression: LambdaExpression<T>): TWhere;
}
