import { TypeWhere } from "../core/utils";
import { WhereBaseBuilderContract } from "./where-base-builder-contract";

export interface WhereBuilderContract<T> extends WhereBaseBuilderContract<T, TypeWhere<T>, WhereBuilderContract<T>> {

}
