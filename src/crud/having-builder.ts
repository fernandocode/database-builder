import { HavingBuilderContract } from "./having-builder-contract";
import { TypeProjection, Utils } from "../core/utils";
import { WhereBaseBuilder } from "./where-base-builder";
import { ProjectionsHelper } from "../core/projections-helper";
import { ColumnParams } from "../core/column-params";

export class HavingBuilder<T>
    extends WhereBaseBuilder<T, TypeProjection<T>, HavingBuilder<T>>
    implements HavingBuilderContract<T> {

    protected _getInstance(): HavingBuilder<T> {
        return this;
    }

    protected _create(typeT: new () => T, alias: string): HavingBuilder<T> {
        return new HavingBuilder(typeT, alias);
    }

    protected getColumnParams(expression: ProjectionsHelper<T>): ColumnParams {
        const compiled = Utils.resolveProjection(expression);
        return {
            column: compiled.projection,
            params: compiled.params
        };
    }
}
