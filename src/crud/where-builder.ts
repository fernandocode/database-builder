import { WhereBuilderContract } from "./where-builder-contract";
import { ExpressionOrValue, Utils } from "./../core/utils";
import { WhereBaseBuilder } from "./where-base-builder";
import { ColumnParams } from "../core/column-params";

// TODO: add LambdaExpression support in WhereBuilder
export class WhereBuilder<T>
    extends WhereBaseBuilder<T, ExpressionOrValue<T>, WhereBuilder<T>>
    implements WhereBuilderContract<T> {

    protected _getInstance(): WhereBuilder<T> {
        return this;
    }

    protected _create(typeT: new () => T, alias: string): WhereBuilder<T> {
        return new WhereBuilder(typeT, alias);
    }

    protected getColumnParams(expression: ExpressionOrValue<T>): ColumnParams {
        return Utils.getColumnValue(expression);
    }
}
