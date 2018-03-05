import { Projection } from "./../crud/enums/projection";
import { ExpressionOrColumn, Utils } from "./utils";
import { ProjectionCompiled } from "..";
import { ProjectionBuilder } from "../crud/projection-builder";

export class ProjectionsUtils<T> {

    public static readonly WILDCARD = "*";

    private _pendingProjections: Projection[] = [];

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
        private _addAliasTableToAlias: boolean = false,
        private _registerProjetionCallback?: (projection: ProjectionCompiled) => void
    ) {
    }

    public apply(
        expression?: ExpressionOrColumn<T>,
        projections: Projection[] = [],
        alias?: string,
        args?: any[]
    ): ProjectionCompiled {
        return this.checkApply(expression, projections, alias, args);
    }

    private create(
        column: string,
        projections: Projection[] = [],
        alias: string = this.defaultAliasAs(column),
        args: any[] = []
    ): ProjectionCompiled {
        return this.createProjection(projections,
            this.addAliasTable(column), alias, args);
    }

    private _apply(
        expression: ExpressionOrColumn<T>,
        projections: Projection[] = [],
        alias?: string,
        args?: any[]
    ): ProjectionCompiled {
        return this.register(
            this.create(Utils.getColumn(expression),
                projections, alias, args)
        );
    }

    private checkApply(
        expression?: ExpressionOrColumn<T>,
        projections: Projection[] = [],
        alias?: string,
        args?: any[]
    ): ProjectionCompiled {
        if (expression === void 0) {
            projections.forEach(projection => {
                this._pendingProjections.unshift(projection);
            });
            return void 0;
        } else {
            this._pendingProjections.forEach(projection => {
                projections.unshift(projection);
            });
            this._pendingProjections = [];
            return this._apply(expression, projections, alias, args);
        }
    }

    private register(projection: ProjectionCompiled): ProjectionCompiled {
        if (this._registerProjetionCallback) {
            this._registerProjetionCallback(projection);
        }
        return projection;
    }

    private createProjection(
        projection: Projection[],
        column: string,
        alias: string = this.defaultAliasAs(column),
        args: any[],
    ): ProjectionCompiled {
        if (projection !== void 0) {
            return this.buildColumn(this.builderProjections(projection, column, args), alias);
        }
        return this.buildColumn(column, alias);
    }

    private defaultAliasAs(column: string): string {
        if (column === ProjectionsUtils.WILDCARD) {
            return "";
        }
        return this._addAliasTableToAlias
            ? `${this._aliasTable}_${column}`
            : column;
    }

    private addAliasTable(
        column: string,
    ): string {
        if (Utils.isNameColumn(column)) {
            return `${this._aliasTable}.${column}`;
        }
        return column;
    }

    private builderProjections(
        projections: Projection[],
        column: string,
        args: any[],
    ): string {
        let result = `${column}${this.buildArgs(args)}`;
        // reverse loop array
        for (let index = projections.length - 1; index >= 0; index--) {
            const projection = projections[index];
            result = this.builderProjection(projection, result);
        }
        return result;
    }

    private builderProjection(
        projection: Projection,
        core: string
    ): string {
        return `${projection}(${core})`;
    }

    private buildArgs(
        args: any[] = [],
    ): string {
        return args.length ? ", " + args.join("") : "";
    }

    private buildColumn(
        column: string,
        alias: string = this.defaultAliasAs(column),
    ): ProjectionCompiled {
        if (alias && alias.length) {
            return new ProjectionCompiled(`${column} AS ${alias}`, []);
        }
        return new ProjectionCompiled(column, []);
    }
}
