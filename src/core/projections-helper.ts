import { Projection } from "./../crud/enums/projection";
import { ExpressionOrColumn, TypeProjection, Utils } from "./utils";
import { ProjectionCompiled } from "..";
import { ProjectionsUtils } from "./projections-utils";

export class ProjectionsHelper<T> {

    private readonly _projectionsUtils: ProjectionsUtils<T>;

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
        private _addAliasTableToAlias: boolean = false,
        private _registerProjetionCallback?: (projection: ProjectionCompiled) => void,
        private _result?: ProjectionCompiled
    ) {
        this._projectionsUtils = new ProjectionsUtils<T>(_aliasTable, _addAliasTableToAlias, void 0, _registerProjetionCallback);
    }

    public _compiled(): ProjectionCompiled {
        return this._result;
    }

    public group(
        alias: string,
        ...projections: Array<TypeProjection<T>>
    ): ProjectionsHelper<T> {
        const projectionsCompiled = new ProjectionCompiled();
        projections.forEach((projection) => {
            const compiled = Utils.resolveProjection(projection);
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

    private getResult(result: ProjectionCompiled): ProjectionsHelper<T> {
        if (result) {
            return new ProjectionsHelper(
                this._typeT, this._aliasTable,
                this._addAliasTableToAlias,
                this._registerProjetionCallback,
                result
            );
        }
        return this;
    }
}
