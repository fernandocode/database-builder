import { ExpressionOrValue } from "./../core/utils";
import { WhereBaseBuilderContract } from "./where-base-builder-contract";

export interface WhereBuilderContract<T> extends WhereBaseBuilderContract<T, ExpressionOrValue<T>, WhereBuilderContract<T>> {

}
