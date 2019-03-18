import { ProjectionModel } from './../crud/projection-model';
import { Projection } from "../crud/enums/projection";
import { ExpressionOrColumn, ExpressionProjection, Utils } from "./utils";
import { ProjectionsUtils } from "./projections-utils";
import { ProjectionCompiled } from "../crud/projection-compiled";

export class ProjectionsHelper<T> {

    private readonly _projectionsUtils: ProjectionsUtils<T>;

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
        private _addAliasTableToAlias: boolean = false,
        private _registerProjetionCallback?: (projection: ProjectionModel) => void,
        private __result?: ProjectionModel[]
    ) {
        this._projectionsUtils = new ProjectionsUtils<T>(_aliasTable, _addAliasTableToAlias, void 0, _registerProjetionCallback);
    }

    public _result(): ProjectionModel[] {
        return this.__result;
    }

    public exp<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [], alias, args));
    }

    public concat(
        alias: string,
        ...projections: Array<ExpressionProjection<any, T>>
    ): ProjectionsHelper<T> {
        return this.group(alias, ...projections);
    }

    public group(
        alias: string,
        ...projections: Array<ExpressionProjection<any, T>>
    ): ProjectionsHelper<T> {
        const projectionsCompiled = new ProjectionCompiled();
        projections.forEach((projection) => {
            const compiled = Utils.resolveExpressionProjection(projection);
            // const compiled = Utils.resolveProjection(projection);
            projectionsCompiled.projection += `${compiled.projection} `;
            projectionsCompiled.params = projectionsCompiled.params.concat(compiled.params);
        });
        projectionsCompiled.projection = projectionsCompiled.projection.trim();

        return this.getResult(this._projectionsUtils.apply(
            projectionsCompiled.projection,
            [Projection.BetweenParenthesis],
            alias, projectionsCompiled.params));
    }

    public sum<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Sum], alias, args));
    }

    public max<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Max], alias, args));
    }

    public min<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Min], alias, args));
    }

    public avg<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Avg], alias, args));
    }

    public count<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Count], alias, args));
    }

    public cast<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Cast], alias, args));
    }

    public distinct<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Distinct], alias, args));
    }

    public round<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Round], alias, args));
    }

    public coalesce<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Coalesce], alias, args));
    }

    private getResult(result: ProjectionModel): ProjectionsHelper<T> {
        if (result) {
            return new ProjectionsHelper(
                this._typeT, this._aliasTable,
                this._addAliasTableToAlias,
                this._registerProjetionCallback,
                [result]
            );
        }
        return this;
    }
}
