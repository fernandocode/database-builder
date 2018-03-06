import { WhereBuilderContract } from "./where-builder-contract";
import { TypeWhere, Utils } from "./../core/utils";
import { WhereBaseBuilder } from "./where-base-builder";
import { ColumnParams } from "../core/column-params";

// TODO: add LambdaExpression support in WhereBuilder
export class WhereBuilder<T>
    extends WhereBaseBuilder<T, TypeWhere<T>, WhereBuilder<T>>
    implements WhereBuilderContract<T> {

    protected _getInstance(): WhereBuilder<T> {
        return this;
    }

    protected _create(typeT: new () => T, alias: string): WhereBuilder<T> {
        return new WhereBuilder(typeT, alias);
    }

    protected getColumnParams(expression: TypeWhere<T>): ColumnParams {
        return Utils.getColumnWhere(expression);
    }
}
