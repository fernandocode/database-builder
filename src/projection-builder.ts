import { QueryCompiled, ValueType } from './utils';
import { Expression, ExpressionUtils } from "lambda-expression";

export class ProjectionBuilder<T> {
    private _projection: ProjectionCompiled = <ProjectionCompiled>{ projection: "", params: [] };
    private static readonly WILDCARD = "*";

    private _expressionUtils: ExpressionUtils;

    constructor(
        typeT: new () => T,
        private _aliasTable: string
    ) {
        this._expressionUtils = new ExpressionUtils();
    }

    public all() {
        this.buildProjection(void 0, ProjectionBuilder.WILDCARD)
    }

    public column(column: string, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjection(void 0,
            column,
            alias
        );
        return this;
    }

    public add(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(void 0,
            expression,
            alias
        );
        return this;
    }

    public sum(expression: Expression<T> | string, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Sum,
            expression,
            alias
        );
        return this;
    }

    public max(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Max,
            expression,
            alias
        );
        return this;
    }

    public min(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Min,
            expression,
            alias
        );
        return this;
    }

    public avg(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Avg,
            expression,
            alias
        );
        return this;
    }

    public avgRound(expression: Expression<T>, alias: string = this.getColumn(expression)): ProjectionBuilder<T> {
        this.buildProjection(Projection.Round,
            `${Projection.Avg}(${this.addAliasTable(this.getColumn(expression))})`,
            alias
        );
        return this;
    }

    public count(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Count,
            expression,
            alias
        );
        return this;
    }

    public countDistinct(expression: Expression<T>, alias: string = ""): ProjectionBuilder<T> {
        this.buildProjection(Projection.Count,
            `${Projection.Distinct} ${this.addAliasTable(this.getColumn(expression))}`,
            alias
        );
        return this;
    }

    public cast(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Cast,
            expression,
            alias
        );
        return this;
    }

    public distinct(expression: Expression<T>, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Distinct,
            expression,
            alias
        );
        return this;
    }

    public coalesce(expression: Expression<T>, defaultValue: any, alias: string = void 0): ProjectionBuilder<T> {
        this.buildProjectionWithExpression(Projection.Coalesce,
            expression,
            alias
        );
        return this;
    }

    // TODO: fazer coalesce para subQuery
    public coalesceBuilder(expression: Expression<T>, defaultValue: any): string {
        return this.builderProjection(Projection.Coalesce,
            this.addAliasTable(this._expressionUtils.getColumnByExpression(expression)),
            [defaultValue]
        );
    }

    public subQuery(subQuery: QueryCompiled, alias: string = ""): ProjectionBuilder<T> {
        this.buildProjection(void 0,
            `(${subQuery.query})`,
            alias
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

    private buildProjectionWithExpression(projection: Projection, expression: Expression<T> | string, alias: string = void 0, args: any[] = []) {
        this.buildProjection(projection, this.getColumn(expression), alias, args);
    }

    private getColumn(expression: Expression<T> | string): string {
        if (typeof expression === 'string') {
            return expression;
        }
        return this._expressionUtils.getColumnByExpression(expression);
    }

    private buildProjection(projection: Projection, column: string, alias: string = column, args: any[] = []) {
        this.checkProjection();
        let projectionBuild = this.createProjection(projection, this.addAliasTable(column), alias, args);
        this._projection.projection += projectionBuild.projection;
        this._projection.params = this._projection.params.concat(projectionBuild.params);
    }

    private addAliasTable(column: string): string {
        let isNameColumn = /^[a-zA-Z0-9_\*]*$/;
        if (isNameColumn.test(column)) {
            return `${this._aliasTable}.${column}`;
        }
        return column;
    }

    private builderProjection(projection: Projection, column: string, args: any[]): string {
        return `${projection}(${column}${this.buildArgs(args)})`;
    }

    private buildArgs(args: any[] = []): string {
        return args.length ? ", " + args.join("") : "";
    }

    private createProjection(projection: Projection, column: string, alias: string = column, args: any[]): ProjectionCompiled {
        if (projection) {
            return this.buildColumn(this.builderProjection(projection, column, args), alias);
        }
        return this.buildColumn(column, alias);
    }

    private buildColumn(column: string, alias: string = column): ProjectionCompiled {
        if (alias === ProjectionBuilder.WILDCARD) {
            return <ProjectionCompiled>{
                projection: column,
                params: []
            };
        }
        if (alias && alias.length) {
            return <ProjectionCompiled>{
                projection: `${column} AS ${alias}`,
                params: []
            };
        }
        return <ProjectionCompiled>{
            projection: column,
            params: []
        };
    }
}

export class ProjectionCompiled {
    projection: string;
    params: ValueType[];
}

export class ProjectionCreator<T>{
    private static readonly WILDCARD = "*";

    private _expressionUtils: ExpressionUtils;

    constructor(
        typeT: new () => T,
        private _aliasTable: string
    ) {
        this._expressionUtils = new ExpressionUtils();
    }

    public column(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(void 0,
            expression,
            alias
        );
    }

    public sum(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Sum,
            expression,
            alias
        );
    }

    public max(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Max,
            expression,
            alias
        );
    }

    public min(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Min,
            expression,
            alias
        );
    }

    public avg(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Avg,
            expression,
            alias
        );
    }

    public count(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Count,
            expression,
            alias
        );
    }

    public cast(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Cast,
            expression,
            alias
        );
    }

    public distinct(expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Distinct,
            expression,
            alias
        );
    }

    public coalesce(expression: Expression<T>, defaultValue: any, alias: string = void 0): string {
        return this.buildProjectionWithExpression(Projection.Coalesce,
            expression,
            alias
        );
    }

    private buildProjectionWithExpression(projection: Projection, expression: Expression<T>, alias: string = void 0): string {
        return this.buildProjection(projection, this._expressionUtils.getColumnByExpression(expression), alias);
    }

    private buildProjection(projection: Projection, column: string, alias: string = column): string {
        return this.createProjection(projection, this.addAliasTable(column), alias);
    }

    private addAliasTable(column: string): string {
        return `${this._aliasTable}.${column}`
    }

    private builderProjection(projection: Projection, column: string): string {
        return `${projection}(${column})`;
    }

    private createProjection(projection: Projection, column: string, alias: string = column): string {
        if (projection) {
            return this.buildColumn(this.builderProjection(projection, column), alias);
        }
        return this.buildColumn(column, alias);
    }

    private buildColumn(column: string, alias: string = column) {
        if (alias === ProjectionCreator.WILDCARD) {
            return column;
        }
        if (alias && alias.length) {
            return `${column} AS ${alias}`;
        }
        return column;
    }
}

export enum Projection {
    Sum = "SUM",
    Max = "MAX",
    Min = "MIN",
    Avg = "AVG",
    Count = "COUNT",
    Cast = "CAST",
    Distinct = "DISTINCT",
    Round = "ROUND",
    Coalesce = "COALESCE"
}