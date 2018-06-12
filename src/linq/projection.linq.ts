import { ExpressionOrColumn } from "../core/utils";
import { Projection } from "..";

export class ProjectionLinq<T> {

    constructor(
        private _typeT: new () => T
    ) {
    }

    // public group(
    //     alias: string,
    //     ...projections: Array<TypeProjection<T>>
    // ): ProjectionLinq<T> {
    //     const projectionsCompiled = new ProjectionCompiled();
    //     projections.forEach((projection) => {
    //         const compiled = Utils.resolveProjection(projection);
    //         projectionsCompiled.projection += `${compiled.projection} `;
    //         projectionsCompiled.params = projectionsCompiled.params.concat(compiled.params);
    //     });
    //     projectionsCompiled.projection = projectionsCompiled.projection.trim();

    //     return this.getResult(this._projectionsUtils.apply(
    //         projectionsCompiled.projection,
    //         [Projection.BetweenParenthesis],
    //         alias, projectionsCompiled.params));
    // }

    // public sum(
    //     expression?: ExpressionOrColumn<T>
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Sum], alias, args));
    // }

    // public max(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Max], alias, args));
    // }

    // public min(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Min], alias, args));
    // }

    // public avg(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Avg], alias, args));
    // }

    // public count(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Count], alias, args));
    // }

    // public cast(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Cast], alias, args));
    // }

    // public distinct(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Distinct], alias, args));
    // }

    // public round(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Round], alias, args));
    // }

    // public coalesce(
    //     expression?: ExpressionOrColumn<T>,
    //     alias: string = "",
    //     args?: any[]
    // ): ProjectionLinq<T> {
    //     return this.getResult(this._projectionsUtils.apply(expression, [Projection.Coalesce], alias, args));
    // }

    // private getResult(
    //     expression?: ExpressionOrColumn<T>,
    //     projections: Projection[] = []
    // ): ProjectionLinq<T> {

    //     // if (result) {
    //     //     return new ProjectionLinq(
    //     //         this._typeT, this._aliasTable,
    //     //         this._addAliasTableToAlias,
    //     //         this._registerProjetionCallback,
    //     //         result
    //     //     );
    //     // }
    //     return this;
    // }
}
