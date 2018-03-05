import { TypeProjection,  } from "./../core/utils";
import { WhereBaseBuilderContract } from "./where-base-builder-contract";

export interface HavingBuilderContract<T> extends WhereBaseBuilderContract<T, TypeProjection<T>, HavingBuilderContract<T>> {

}
