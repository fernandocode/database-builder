import { Expression, ExpressionUtils } from "lambda-expression";
import { PlanRef } from "./../core/plan-ref";
import { ProjectionsUtils } from "./../core/projections-utils";
import { BuilderCompiled } from "../core/builder-compiled";
import { MapperTable } from "./../mapper-table";
import { WhereBuilder } from "./where-builder";
import { ExpressionOrColumn, ProjectionOrValue, TypeProjection, Utils, ValueType, ValueTypeToParse } from "./../core/utils";
import { ColumnRef } from "./../core/column-ref";
import { QueryCompiled } from "./../core/query-compiled";
import { WhereCompiled } from "./where-compiled";
import { ProjectionCompiled } from "./projection-compiled";
import { Projection } from "./enums/projection";
import { ProjectionCase } from "./projection-case";
import { MetadataTable } from "../metadata-table";
import { ProjectionsHelper } from "../core/projections-helper";

export class ProjectionBuilder<T> {
    private _projection: ProjectionCompiled = new ProjectionCompiled();

    private readonly _projectionsUtils: ProjectionsUtils<T>;

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
        private _addAliasTableToAlias: boolean = false
    ) {
        this._projectionsUtils = new ProjectionsUtils(
            _typeT, _aliasTable, _addAliasTableToAlias,
            (projection: ProjectionCompiled) => this.applyProjection(projection)
        );
    }

    public all() {
        this.apply(ProjectionsUtils.WILDCARD);
    }

    public allByMap(metadade: MetadataTable<T>) {
        this.selectAllColumns(metadade.mapperTable);
    }

    public proj(): ProjectionsHelper<T> {
        return new ProjectionsHelper(this._typeT, this._aliasTable, false);
    }

    public ref(column: string): ColumnRef {
        return new ColumnRef(column, this._aliasTable);
    }

    public plan(value: any): PlanRef {
        return new PlanRef(value);
    }

    // use `.proj()`
    // public create(): ProjectionBuilder<T> {
    //     return new ProjectionBuilder(this._typeT, this._aliasTable);
    // }

    public group(
        alias: string,
        ...projections: Array<TypeProjection<T>>,
    ): ProjectionBuilder<T> {
        const groupCompiled = this.proj().group(alias, ...projections)._compiled();
        this.apply(
            groupCompiled.projection,
            [],
            "",
            groupCompiled.params
        );
        return this;
    }

    /**
     * @deprecated Use `add`
     * @param column
     * @param alias
     */
    public column(
        column: string,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.apply(column, void 0, alias);
        return this;
    }

    public columns(
        ...expressions: Array<ExpressionOrColumn<T>>
    ): ProjectionBuilder<T> {
        for (const key in expressions) {
            if (expressions.hasOwnProperty(key)) {
                const expression = expressions[key];
                this.add(expression);
            }
        }
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
        expression?: ExpressionOrColumn<T> | string,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Sum,
            expression,
            alias,
        );
        return this;
    }

    public max(
        expression?: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Max,
            expression,
            alias,
        );
        return this;
    }

    public min(
        expression?: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Min,
            expression,
            alias,
        );
        return this;
    }

    public avg(
        expression?: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Avg,
            expression,
            alias,
        );
        return this;
    }

    /**
     * @deprecated use `.avg().round(expression)`
     *
     * @param {ExpressionOrColumn<T>} expression
     * @param {string} [alias]
     * @returns {ProjectionBuilder<T>}
     * @memberof ProjectionBuilder
     */
    public avgRound(
        expression: ExpressionOrColumn<T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.apply(expression, [Projection.Round, Projection.Avg], alias);
        return this;
    }

    public round(
        expression?: ExpressionOrColumn<T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Round,
            expression,
            alias,
        );
        return this;
    }

    public count(
        expression?: ExpressionOrColumn<T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Count,
            expression,
            alias,
        );
        return this;
    }

    /**
     * @deprecated use `.count().distinct(expression)`
     *
     * @param {ExpressionOrColumn<T>} expression
     * @param {string} [alias]
     * @returns {ProjectionBuilder<T>}
     * @memberof ProjectionBuilder
     */
    public countDistinct(
        expression: ExpressionOrColumn<T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.apply(expression, [Projection.Count, Projection.Distinct], alias);
        return this;
    }

    public cast(
        expression?: ExpressionOrColumn<T>,
        alias: string = void 0,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Cast,
            expression,
            alias,
        );
        return this;
    }

    public distinct(
        expression?: ExpressionOrColumn<T>,
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

    /**
     * @deprecated use `.proj()`
     *
     * @param {Projection} projection
     * @param {ExpressionOrColumn<T>} expression
     * @param {string} [alias=""]
     * @param {any[]} [args=[]]
     * @returns
     * @memberof ProjectionBuilder
     */
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
        this.apply(subQuery.query, [Projection.BetweenParenthesis], alias);
        this._projection.params = this._projection.params.concat(subQuery.params);
        return this;
    }

    public compile(): ProjectionCompiled {
        return this._projection;
    }

    private selectAllColumns(mapper: MapperTable): void {
        for (const key in mapper.columns) {
            if (mapper.columns.hasOwnProperty(key)) {
                const column = mapper.columns[key];
                this.add(column.column);
            }
        }
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
        this.apply(expression, projection ? [projection] : void 0, alias, args);
    }

    private apply(
        expression?: ExpressionOrColumn<T>,
        projections: Projection[] = [],
        alias?: string,
        args?: any[]) {
        this._projectionsUtils.apply(expression, projections, alias, args);
    }

    private applyProjection(
        projection: ProjectionCompiled
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

    private defaultAliasAs(column: string): string {
        if (column === ProjectionsUtils.WILDCARD) {
            return "";
        }
        return this._addAliasTableToAlias
            ? `${this._aliasTable}_${column}`
            : column;
    }

    private createProjection(
        projection: Projection,
        column: string,
        alias: string = this.defaultAliasAs(column),
        args: any[],
    ): ProjectionCompiled {
        if (projection !== void 0) {
            return this.buildColumn(this.builderProjection(projection, column, args), alias);
        }
        return this.buildColumn(column, alias);
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
