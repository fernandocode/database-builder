import { LambdaExpression } from "lambda-expression";
import { LambdaMetadata } from "../core/lambda-metadata";
import { ExpressionOrColumn, ExpressionProjection, ParamType, Utils, ValueTypeToParse, ExpressionQuery } from "../core/utils";
import { WhereCompiled } from "./where-compiled";
import { Condition } from "./enums/condition";
import { DatabaseHelper } from "../database-helper";
import { DatabaseBuilderError } from "../core/errors";
import { WhereBaseBuilderContract } from "./where-base-builder-contract";
import { ColumnParams } from "../core/column-params";
import { ColumnRef } from "../core/column-ref";
import { ProjectionsHelper } from "../core/projections-helper";
import { SqlCompilable } from "./sql-compilable";
import { QueryHelper } from '../core/query-helper';
import { PlanRef } from '../core/plan-ref';

export abstract class WhereBaseBuilder<
    T,
    TExpression,
    TWhere extends WhereBaseBuilder<T, TExpression, TWhere>
    > implements WhereBaseBuilderContract<T, TExpression, TWhere> {

    private static readonly AND: string = "AND";
    private static readonly OR: string = "OR";

    private _where: string = "";
    private _params: ParamType[] = [];

    private _pendingConditions: Condition[] = [];
    private _pendingAndOr: string = WhereBaseBuilder.AND;

    private readonly _databaseHelper: DatabaseHelper;

    constructor(
        // TODO: verificar e se é possivel remover declaração de tipo de instancia, é usar apenas o generics,
        // pois o join está passando "void 0" e declarando apenas o generics
        private _typeT: new () => T,
        private _alias: string
    ) {
        this._databaseHelper = new DatabaseHelper();
    }

    public proj(): ProjectionsHelper<T> {
        return new ProjectionsHelper(this._typeT, this._alias, false);
    }

    public concat(
        ...projections: Array<ExpressionProjection<any, T>>
    ): ProjectionsHelper<T> {
        return this.proj().concat("", ...projections);
    }

    public coalesce<TExpressionReturn>(
        expression: ExpressionQuery<TExpressionReturn, T>,
        argumentsCoalesce: any[],
        alias: string = "",
        args?: any[]
        // expression: ExpressionOrColumn<TReturn, T>,
        // // alias?: string,
        // ...args: any[]
    ): ProjectionsHelper<T> {
        return this.proj().coalesce(expression, argumentsCoalesce, alias, args);
    }

    public ref<TExpressionReturn>(expression: ExpressionOrColumn<TExpressionReturn, T>, alias: string = this._alias): ColumnRef {
        return new ColumnRef(
            Utils.getColumn(expression),
            alias
        );
    }

    public not(): TWhere {
        this._pendingConditions.push(Condition.Not);
        return this._getInstance();
    }

    public and(): TWhere {
        this._pendingAndOr = WhereBaseBuilder.AND;
        return this._getInstance();
    }

    public or(): TWhere {
        this._pendingAndOr = WhereBaseBuilder.OR;
        return this._getInstance();
    }

    public scope(
        scopeCallback: (scope: TWhere) => void,
    ): TWhere {
        const instanceScope: TWhere = this._create(this._typeT, this._alias);
        scopeCallback(instanceScope);
        this.compileScope(instanceScope.compile());
        return this._getInstance();
    }

    /**
     * @deprecated Use `equal`
     * @param expression
     * @param column
     */
    public equalColumn(
        expression: TExpression,
        column: string,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Equal],
            this.getColumnParams(expression),
            column,
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `equal`
     */
    public equalValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Equal],
            this.getColumnParams(expression),
            [value]
        );
        return this._getInstance();
    }

    public equal(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Equal],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `like`
     */
    public likeValue(
        expression: TExpression,
        value: string,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Like],
            this.getColumnParams(expression),
            [value]);
        return this._getInstance();
    }

    public like(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Like],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    public multiColumnLike(like: string, separator: string, ...columns: TExpression[]): TWhere {
        const columnsExpression = columns
            .map((column) => this.getColumnParams(column))
            .map(({ column, params }) => this.coalesce(
                QueryHelper.compileWithoutParams(
                    Utils.addAlias(column, this._alias),
                    params.map(param => Utils.getDatabaseHelper().parseToValueType(param))
                ), ['']).resultWithoutParams()[0]
            )
            .join(` || '${separator}' || `);

        this.contains(new PlanRef(columnsExpression) as any, like.toUpperCase());

        return this._getInstance();
    }

    public contains(
        expression: TExpression,
        value: string
    ): TWhere {
        return this.likeValue(expression, `%${value}%`);
    }

    public startsWith(
        expression: TExpression,
        value: string,
    ): TWhere {
        return this.likeValue(expression, `${value}%`);
    }

    public endsWith(
        expression: TExpression,
        value: string,
    ): TWhere {
        return this.likeValue(expression, `%${value}`);
    }

    public isNull(
        expression1: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.IsNull],
            this.getColumnParams(expression1),
            void 0,
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `great`
     */
    public greatValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Great],
            this.getColumnParams(expression),
            [value]
        );
        return this._getInstance();
    }

    public great(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Great],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `greatAndEqual`
     */
    public greatAndEqualValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.GreatAndEqual],
            this.getColumnParams(expression),
            [value]
        );
        return this._getInstance();
    }

    public greatAndEqual(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.GreatAndEqual],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `less`
     */
    public lessValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Less],
            this.getColumnParams(expression),
            [value]
        );
        return this._getInstance();
    }

    public less(
        expression1: TExpression,
        expression2: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Less],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `lessAndEqual`
     */
    public lessAndEqualValue(
        expression: TExpression,
        value: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.LessAndEqual],
            this.getColumnParams(expression),
            [value]
        );
        return this._getInstance();
    }

    public lessAndEqual(
        expression1: TExpression,
        expression2: TExpression
    ): TWhere {
        this.buildWhereColumn(
            [Condition.LessAndEqual],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    /**
     * @deprecated use `between`
     */
    public betweenValue(
        expression: TExpression,
        value1: ValueTypeToParse,
        value2: ValueTypeToParse
    ): TWhere {
        return this.between(expression, value1 as any, value2 as any);
    }

    public between(
        expression: TExpression,
        startExpression: TExpression,
        endExpression: TExpression
        // value1: ValueTypeToParse,
        // value2: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Between],
            this.getColumnParams(expression),
            this.getColumnParams(startExpression),
            this.getColumnParams(endExpression)
        );
        // [startExpression, endExpression]);
        return this._getInstance();
    }

    /**
     * @deprecated use `in`
     */
    public inValues(
        expression: TExpression,
        values: ValueTypeToParse[],
    ): TWhere {
        return this.in(expression, values);
    }

    public in(
        expression: TExpression,
        valuesOrQuery: ValueTypeToParse[] | SqlCompilable,
    ): TWhere {
        if (Utils.isArray(valuesOrQuery)) {
            this.buildWhereColumn(
                [Condition.In],
                this.getColumnParams(expression),
                valuesOrQuery as ValueTypeToParse[]);
        } else {
            const compileds = (valuesOrQuery as SqlCompilable).compile();
            compileds.forEach(compiled => {
                this.buildWhereColumn(
                    [Condition.In],
                    this.getColumnParams(expression),
                    compiled.query);
                this.addParam(compiled.params);
            });
        }
        return this._getInstance();
    }

    /**
     * @deprecated use `in`
     */
    public inSelect(
        expression: TExpression,
        query: SqlCompilable,
    ): TWhere {
        return this.in(expression, query);
    }

    public compile(): WhereCompiled {
        return {
            params: this._params,
            where: this._where,
        };
    }

    public expression(expression: LambdaExpression<T>): TWhere {
        const metadata = Utils.getLambdaMetadata(expression);
        this.buildWhereMetadata(metadata);
        return this._getInstance();
    }

    public _addParams(params: ParamType[]): TWhere {
        this._params = this._params.concat(params);
        return this._getInstance();
    }

    protected abstract _getInstance(): TWhere;
    protected abstract _create(
        typeT: new () => T,
        alias: string
    ): TWhere;

    protected abstract getColumnParams(expression: TExpression): ColumnParams;

    protected buildWhereWithExpressionOrValue(
        condition: Condition[],
        expression1: TExpression,
        expression2: TExpression,
    ) {
        const column1 = this.getColumnParams(expression1);
        const column2 = this.getColumnParams(expression2);
        this.buildWhereColumn(condition, column1, column2);
    }

    protected buildWhereColumn(
        condition: Condition[],
        ...valuesOrColumns: Array<ColumnParams | string | ValueTypeToParse[]>
    ) {
        const columnsParams = valuesOrColumns.map(x => this.processParam(x));
        this.buildWhereParams(
            condition,
            columnsParams.map(x => Utils.addAlias(x.column, this._alias)),
            columnsParams.map((value) => value.params)
                // alternative Array.flat()
                // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#Alternativa
                .reduce((acc, val) => acc.concat(val), [])
        );
    }

    protected buildWhereParams(
        condition: Condition[],
        columns: string[],
        params: ValueTypeToParse[],
    ) {
        this.buildWhere(
            condition,
            columns
        );
        this.addParam(params);
    }

    protected buildWhere(
        conditions: Condition[],
        columns: string[]
    ) {
        this.checkWhere();
        this._where += this.createWhere(conditions, columns);
    }

    protected addParam(
        param: ValueTypeToParse | ValueTypeToParse[],
    ) {
        if (Array.isArray(param)) {
            param.forEach((value) => {
                this.addValueParam(value);
            });
        } else {
            this.addValueParam(param);
        }
    }

    private processParam(param: ColumnParams | string | ValueTypeToParse[]): ColumnParams {
        if (Utils.isNull(param)) {
            return {
                column: void 0,
                params: []
            } as ColumnParams;
        }
        if (Array.isArray(param)) {
            const result = {
                column: "",
                params: []
            } as ColumnParams;
            param.forEach((value) => {
                result.column += (result.column as string).length > 0 ? ", ?" : "?";
                result.params.push(value);
            });
            return result;
        }
        if (Utils.isString(param)) {
            return {
                column: param as string,
                params: []
            } as ColumnParams;
        }
        return param as ColumnParams;
    }

    private buildWhereMetadata(metadata: LambdaMetadata) {
        if (!Utils.isNameColumn(metadata.left) && Utils.isValue(metadata.left)) {
            this.addParam(Utils.clearParamLambda(metadata.left));
            metadata.left = "?";
        }
        if (!Utils.isNameColumn(metadata.right) && Utils.isValue(metadata.right)) {
            this.addParam(Utils.clearParamLambda(metadata.right));
            metadata.right = "?";
        }
        this.buildWhere(metadata.condition, [Utils.addAlias(metadata.left, this._alias), Utils.addAlias(metadata.right, this._alias)]);
    }

    private addValueParam(
        param: ValueTypeToParse,
    ) {
        this._params.push(
            this._databaseHelper.parseToValueType(Utils.clearParam(param)),
        );
    }

    private createWhere(
        conditions: Condition[],
        columns: string[]
    ) {
        // TODO: verificar se colunas não são condition, para remover a condition
        let conditionsArray = this._pendingConditions.concat(conditions);
        this._pendingConditions = [];
        if (columns.length === 2) {
            const isConditionIsNullInColumn2 = columns[1] === Condition.IsNull;
            if (isConditionIsNullInColumn2) {
                conditionsArray = this.conditionIsNull(conditionsArray);
                columns.pop();
            }
        }
        return this.buildConditions(
            conditionsArray,
            columns
        );
    }

    private conditionIsNull(currentConditions: Condition[]): Condition[] {
        // new scope
        if (!currentConditions || (currentConditions.length === 1 && Utils.isNull(currentConditions[0]))) {
            return [Condition.IsNull];
        }
        switch (currentConditions.toString()) {
            case [Condition.Equal].toString():
                return [Condition.IsNull];
            case [Condition.Not, Condition.Equal].toString():
                return [Condition.Not, Condition.IsNull];
            default:
                return currentConditions;
        }
    }

    private buildConditions(
        conditions: Condition[],
        columns: string[]
    ): string {
        // new scope
        if (!conditions || (conditions.length === 1 && Utils.isNull(conditions[0]))) {
            return `(${columns[0]})`;
        }
        switch (conditions.toString()) {
            case [Condition.Between].toString():
            case [Condition.Not, Condition.Between].toString():
                // ${column} BETWEEN ${columnOrParam} AND ${columnOrParam}
                if (columns.length === 3) {
                    return `${columns[0]} ${this.builderConditions(conditions)} ${columns[1]} ${WhereBaseBuilder.AND} ${columns[2]}`;
                }
                throw new DatabaseBuilderError(`Length (${columns.length}) (values: ${columns}) parameter to '${conditions}' condition incorrect!`);
            case [Condition.In].toString():
            case [Condition.Not, Condition.In].toString():
                // ${column} IN (?, ?, ...)
                return `${columns[0]} ${this.builderConditions(conditions)} (${columns[1]})`.trim();
            case [Condition.Not, Condition.IsNull].toString():
                return `${columns[0]} IS NOT NULL`.trim();
            case [Condition.Not, Condition.Equal].toString():
                return `${columns[0]} <> ${columns[1]}`.trim();
            case [Condition.Not, Condition.Great].toString():
                return this.buildConditions([Condition.LessAndEqual], columns);
            case [Condition.Not, Condition.GreatAndEqual].toString():
                return this.buildConditions([Condition.Less], columns);
            case [Condition.Not, Condition.Less].toString():
                return this.buildConditions([Condition.GreatAndEqual], columns);
            case [Condition.Not, Condition.LessAndEqual].toString():
                return this.buildConditions([Condition.Great], columns);
            default:
                if (columns[1]) {
                    return `${columns[0]} ${this.builderConditions(conditions)} ${columns[1]}`.trim();
                }
                return `${columns[0]} ${this.builderConditions(conditions)}`.trim();
        }
    }

    private builderConditions(conditions: Condition[]): string {
        return conditions.join(" ");
    }

    private checkWhere() {
        this._where += this._where.length ? ` ${this._pendingAndOr} ` : "";
        this._pendingAndOr = WhereBaseBuilder.AND;
    }

    private compileScope(
        compiled: WhereCompiled,
    ) {
        this.buildWhereColumn(
            void 0,
            {
                column: compiled.where,
                params: compiled.params
            } as ColumnParams,
            void 0
        );
    }
}
