import { ProjectionModel } from "./../crud/projection-model";
import { Projection } from "../crud/enums/projection";
import { ExpressionOrColumn, ExpressionProjection, ExpressionQuery, Utils } from "./utils";
import { ProjectionsUtils } from "./projections-utils";
import { ProjectionCompiled } from "../crud/projection-compiled";
import { SqlCompilable } from "../crud/sql-compilable";
import { QueryCompiled } from "./query-compiled";
import { DatabaseBuilderError } from "./errors";
import { QueryHelper } from "./query-helper";

export class ProjectionsHelper<T> {

    private readonly _projectionsUtils: ProjectionsUtils<T>;

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
        private _addAliasTableToAlias: boolean = false,
        private _registerProjetionCallback?: (projection: ProjectionModel) => void,
        // tslint:disable-next-line: variable-name
        private __result?: ProjectionModel[]
    ) {
        this._projectionsUtils = new ProjectionsUtils<T>(_aliasTable, _addAliasTableToAlias, void 0, _registerProjetionCallback);
    }

    public _result(): ProjectionModel[] {
        return this.__result;
    }

    public resultWithoutParams(): string[] {
        const result = this._result();
        return result.map(r => QueryHelper.compileWithoutParams(r.projection, r.params));
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
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Sum], alias, args));
    }

    public max<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Max], alias, args));
    }

    public min<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Min], alias, args));
    }

    public avg<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Avg], alias, args));
    }

    public count<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Count], alias, args));
    }

    public cast<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Cast], alias, args));
    }

    public distinct<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Distinct], alias, args));
    }

    public round<TReturn>(
        expression?: ExpressionQuery<TReturn, T>,
        alias: string = "",
        args?: any[]
    ): ProjectionsHelper<T> {
        return this.getResult(this._projectionsUtils.apply(expression, [Projection.Round], alias, args));
    }

    public coalesce<TReturn>(
        expression: ExpressionQuery<TReturn, T>,
        argumentsCoalesce: any[],
        alias: string = "",
        args: any[] = []
    ): ProjectionsHelper<T> {
        if (argumentsCoalesce && argumentsCoalesce.length === 0) {
            throw new DatabaseBuilderError(`At least one argument is necessary in the coalesce!`);
        }
        if (Utils.isQueryCompilable(expression)) {
            return this.coalesce((expression as SqlCompilable).compile(), argumentsCoalesce, alias, args);
        }
        if (Utils.isQueryCompiledArray(expression)) {
            if ((expression as QueryCompiled[]).length === 1) {
                return this.coalesce(`(${(expression as QueryCompiled[])[0].query})`, argumentsCoalesce, alias, (expression as QueryCompiled[])[0].params);
            } else {
                throw new DatabaseBuilderError(`query cascade isn't supported in projections (${(expression as QueryCompiled[]).length})`);
            }
        }
        return this.getResult(this._projectionsUtils.apply([`${this._projectionsUtils.addAliasTable(Utils.getColumn(expression as ExpressionOrColumn<TReturn, T>))}`, ...argumentsCoalesce.map(x => "?")].join(", "), [Projection.Coalesce], alias, [...args, ...argumentsCoalesce]));
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
