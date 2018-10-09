import { QueryCompiled } from "../core/query-compiled";
import { ProjectionsUtils } from "../core/projections-utils";
import { BuilderCompiled } from "../core/builder-compiled";
import { MapperTable } from "../mapper-table";
import { ExpressionOrColumn, ExpressionProjection, Utils } from "../core/utils";
import { ColumnRef } from "../core/column-ref";
import { PlanRef } from "../core/plan-ref";
import { ProjectionCompiled } from "./projection-compiled";
import { Projection } from "./enums/projection";
import { ProjectionCase } from "./projection-case";
import { MetadataTable } from "../metadata-table";
import { ProjectionsHelper } from "../core/projections-helper";
import { DatabaseBuilderError } from "../core/errors";
import { QueryCompilable } from "../core/query-compilable";

export class ProjectionBuilder<T> {
    private _projection: ProjectionCompiled = new ProjectionCompiled();

    private readonly _projectionsUtils: ProjectionsUtils<T>;

    constructor(
        private _typeT: new () => T,
        private _aliasTable: string,
        private _addAliasTableToAlias: boolean = false,
        addAliasDefault?: boolean
    ) {
        this._projectionsUtils = new ProjectionsUtils(
            _aliasTable, _addAliasTableToAlias, addAliasDefault,
            (projection: ProjectionCompiled) => this.applyProjection(projection)
        );
    }

    public all() {
        this.apply(ProjectionsUtils.WILDCARD);
    }

    public allByMap(metadata: MetadataTable<T>) {
        if (metadata === void 0) {
            throw new DatabaseBuilderError(`Mapper not found for '${this._typeT.name}'`);
        }
        this.selectAllColumns(metadata.mapperTable);
    }

    public proj(): ProjectionsHelper<T> {
        return new ProjectionsHelper(this._typeT, this._aliasTable, false);
    }

    public ref<TReturn>(expression: ExpressionOrColumn<TReturn, T>, alias: string = this._aliasTable): ColumnRef {
        return new ColumnRef(
            Utils.getColumn(expression),
            alias
        );
    }

    public plan(value: any): PlanRef {
        return new PlanRef(value);
    }

    public group(
        alias: string,
        ...projections: Array<ExpressionProjection<any, T>>
        // ...projections: Array<TypeProjection<T>>
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
        alias?: string,
    ): ProjectionBuilder<T> {
        this.apply(column, void 0, alias);
        return this;
    }

    public columns(
        ...expressions: Array<ExpressionOrColumn<any, T>>
    ): ProjectionBuilder<T> {
        for (const key in expressions) {
            if (expressions.hasOwnProperty(key)) {
                const expression = expressions[key];
                this.add(expression);
            }
        }
        return this;
    }

    public add<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(void 0,
            expression,
            alias,
        );
        return this;
    }

    public sum<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T> | string,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Sum,
            expression,
            alias,
        );
        return this;
    }

    public max<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Max,
            expression,
            alias,
        );
        return this;
    }

    public min<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Min,
            expression,
            alias,
        );
        return this;
    }

    public avg<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias?: string,
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
    public avgRound<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.apply(expression, [Projection.Round, Projection.Avg], alias);
        return this;
    }

    public round<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Round,
            expression,
            alias,
        );
        return this;
    }

    public count<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
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
    public countDistinct<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.apply(expression, [Projection.Count, Projection.Distinct], alias);
        return this;
    }

    public cast<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Cast,
            expression,
            alias,
        );
        return this;
    }

    public distinct<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Distinct,
            expression,
            alias,
        );
        return this;
    }

    // CASE {expression} {when} END
    public case<TReturn>(
        caseCallback: (caseInstance: ProjectionCase<TReturn, T>) => void,
        expression: ExpressionOrColumn<TReturn, T> = void 0,
        alias?: string,
    ): ProjectionBuilder<T> {
        const instanceCase: ProjectionCase<TReturn, T> = new ProjectionCase(expression, alias);
        caseCallback(instanceCase);
        this.compileCase(instanceCase.compile());
        return this;
    }

    public coalesce<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        alias?: string,
    ): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Coalesce,
            expression,
            alias,
        );
        return this;
    }

    public coalesceP(
        projectionCallback: (projection: ProjectionBuilder<T>) => void,
        defaultValue: any,
        alias: string,
    ): ProjectionBuilder<T> {
        const instanceProjection: ProjectionBuilder<T> = new ProjectionBuilder(this._typeT, this._aliasTable, void 0, false);
        projectionCallback(instanceProjection);
        const projectionInner = instanceProjection.compile();
        this.buildProjectionWithExpression(Projection.Coalesce,
            `${projectionInner.projection}, ${defaultValue}`,
            alias,
            projectionInner.params
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
    public projection<TReturn>(
        projection: Projection,
        expression: ExpressionOrColumn<TReturn, T>,
        alias: string = "",
        args: any[] = [],
    ) {
        return this.createProjection(projection, this.addAliasTable(Utils.getColumn(expression)), alias, args);
    }

    // TODO: fazer coalesce para subQuery
    public coalesceBuilder<TReturn>(
        expression: ExpressionOrColumn<TReturn, T>,
        defaultValue: any,
    ): string {
        return this.builderProjection(Projection.Coalesce,
            this.addAliasTable(Utils.getColumn(expression)),
            [defaultValue],
        );
    }

    public subQuery(
        subQuery: QueryCompiled[] | QueryCompilable,
        alias: string = "",
    ): ProjectionBuilder<T> {
        if ((subQuery as QueryCompilable).compile) {
            return this.subQuery((subQuery as QueryCompilable).compile(), alias);
        }
        (subQuery as QueryCompiled[])
            .forEach(compiled => {
                this.apply(compiled.query, [Projection.BetweenParenthesis], alias);
                this._projection.params = this._projection.params.concat(compiled.params);
            });
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

    private buildProjectionWithExpression<TReturn>(
        projection: Projection,
        expression: ExpressionOrColumn<TReturn, T> | string,
        alias?: string,
        args: any[] = []
    ) {
        this.apply(expression, projection ? [projection] : void 0, alias, args);
    }

    private apply<TReturn>(
        expression?: ExpressionOrColumn<TReturn, T>,
        projections: Projection[] = [],
        alias?: string,
        args?: any[]
    ) {
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
