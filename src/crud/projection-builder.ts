import { QueryCompiled } from "./../core/query-compiled";
import { WhereBuilder } from "./where-builder";
import { ExpressionOrColumn, ProjectionOrValue, Utils, ValueType, ValueTypeToParse } from "./../core/utils";
import { Expression, ExpressionUtils } from "lambda-expression";
import { BuilderCompiled } from "../core/builder-compiled";
import { WhereCompiled } from "./where-compiled";
import { ProjectionCompiled } from "./projection-compiled";
import { Projection } from "./enums/projection";
import { ProjectionCase } from "./projection-case";

export class ProjectionBuilder<T> {
    private static readonly WILDCARD = "*";
    private _projection: ProjectionCompiled = new ProjectionCompiled();

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
    ) {
    }

    public all() {
        this.buildProjection(void 0, ProjectionBuilder.WILDCARD);
    }

    public create(): ProjectionBuilder<T> {
        return new ProjectionBuilder(this._typeT, this._aliasTable);
    }

    /**
     * Group projection support
     * Usage:
     * @example
     *  projection.group(
     *      "sumColumn1AddColumn2",
     *      projection.projection(Projection.Sum, projection.getColumn(x => x.column1)),
     *      new ProjectionCompiled(Operator.Add),
     *      projection.projection(void 0, projection.getColumn(x => x.column2)),
     *  );
     * // result: (SUM(column1) + column2) AS sumColumn1AddColumn2
     * @param {string} alias
     * @param {...Array<ProjectionCompiled>} projections
     * @returns {ProjectionBuilder<T>}
     * @memberof ProjectionBuilder
     */
    public group(
        alias: string,
        ...projections: ProjectionCompiled[],
    ): ProjectionBuilder<T> {
        const projectionCompiled = new ProjectionCompiled();
        projections.forEach((projection) => {
            projectionCompiled.projection += `${projection.projection} `;
            projectionCompiled.params = projectionCompiled.params.concat(projection.params);
        });
        projectionCompiled.projection = projectionCompiled.projection.trim();

        this.buildProjection(Projection.BetweenParenthesis,
            projectionCompiled.projection, alias, projectionCompiled.params);

        return this;
    }

    public column(
        column: string,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjection(void 0,
            column,
            alias,
        );
        return this;
    }

    public add(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(void 0,
            expression,
            alias,
        );
        return this;
    }

    public sum(
        expression: ExpressionOrColumn<T> | string,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Sum,
            expression,
            alias,
        );
        return this;
    }

    public max(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Max,
            expression,
            alias,
        );
        return this;
    }

    public min(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Min,
            expression,
            alias,
        );
        return this;
    }

    public avg(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Avg,
            expression,
            alias,
        );
        return this;
    }

    public avgRound(
        expression: ExpressionOrColumn<T>,
        alias: string = Utils.getColumn(expression),
    ): ProjectionBuilder<T> {
        this.buildProjection(Projection.Round,
            `${Projection.Avg}(${this.addAliasTable(Utils.getColumn(expression))})`,
            alias,
        );
        return this;
    }

    public count(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Count,
            expression,
            alias,
        );
        return this;
    }

    public countDistinct(
        expression: ExpressionOrColumn<T>,
        alias: string = "",
    ): ProjectionBuilder<T> {
        this.buildProjection(Projection.Count,
            `${Projection.Distinct} ${this.addAliasTable(Utils.getColumn(expression))}`,
            alias,
        );
        return this;
    }

    public cast(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Cast,
            expression,
            alias,
        );
        return this;
    }

    public distinct(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Distinct,
            expression,
            alias,
        );
        return this;
    }

    // CASE {expression} {when} END
    public case(
        caseCallback: (caseInstance: ProjectionCase<T>) => void,
        expression: ExpressionOrColumn<T> = void 0,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        const instanceCase: ProjectionCase<T> = new ProjectionCase(expression, alias);
        caseCallback(instanceCase);
        this.compileCase(instanceCase.compile());
        return this;
    }

    public coalesce(
        expression: ExpressionOrColumn<T>,
        alias: string = void 0,
        ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Coalesce,
            expression,
            alias,
        );
        return this;
    }

    public projection(
        projection: Projection,
        expression: ExpressionOrColumn<T>,
        alias: string = "",
        args: any[] = [],
    ) {
        return this.createProjection(projection, this.addAliasTable(Utils.getColumn(expression)), alias, args);
    }

    // TODO: fazer coalesce para subQuery
    public coalesceBuilder(
        expression: ExpressionOrColumn<T>,
        defaultValue: any,
    ): string {
        return this.builderProjection(Projection.Coalesce,
            this.addAliasTable(Utils.getColumn(expression)),
            [defaultValue],
        );
    }

    public subQuery(
        subQuery: QueryCompiled,
        alias: string = "",
        ): ProjectionBuilder<T> {
        this.buildProjection(void 0,
            `(${subQuery.query})`,
            alias,
        );
        this._projection.params = this._projection.params.concat(subQuery.params);
        return this;
    }

    public compile(): ProjectionCompiled {
        return this._projection;
    }

    private checkProjection() {
        this._projection.projection += this._projection.projection.length ? ", " : "";
    }

    private compileCase(
        compiled: BuilderCompiled,
    ) {
        if (compiled.builder.length) {
            this.applyProjection(new ProjectionCompiled(compiled.builder, compiled.params));
        }
    }

    private buildProjectionWithExpression(
        projection: Projection,
        expression: ExpressionOrColumn<T> | string,
        alias: string = void 0,
        args: any[] = []) {
        this.buildProjection(projection, Utils.getColumn(expression), alias, args);
    }

    private buildProjection(
        projection: Projection,
        column: string,
        alias: string = column,
        args: any[] = [],
        ) {
        const projectionBuild = this.createProjection(projection, this.addAliasTable(column), alias, args);
        this.applyProjection(projectionBuild);
    }

    private applyProjection(
        projection: ProjectionCompiled,
    ) {
        this.checkProjection();
        this._projection.projection += projection.projection;
        this._projection.params = this._projection.params.concat(projection.params);
    }

    private addAliasTable(
        column: string,
    ): string {
        if (Utils.isNameColumn(column)) {
            return `${this._aliasTable}.${column}`;
        }
        return column;
    }

    private builderProjection(
        projection: Projection,
        column: string,
        args: any[],
    ): string {
        return `${projection}(${column}${this.buildArgs(args)})`;
    }

    private buildArgs(
        args: any[] = [],
    ): string {
        return args.length ? ", " + args.join("") : "";
    }

    private createProjection(
        projection: Projection,
        column: string,
        alias: string = column,
        args: any[],
    ): ProjectionCompiled {
        if (projection) {
            return this.buildColumn(this.builderProjection(projection, column, args), alias);
        }
        return this.buildColumn(column, alias);
    }

    private buildColumn(
        column: string,
        alias: string = column,
    ): ProjectionCompiled {
        if (alias === ProjectionBuilder.WILDCARD) {
            return new ProjectionCompiled(column, []);
        }
        if (alias && alias.length) {
            return new ProjectionCompiled(`${column} AS ${alias}`, []);
        }
        return new ProjectionCompiled(column, []);
    }
}
