import { DatabaseHelper } from "./../database-helper";
import { LambdaExpression } from "lambda-expression";
import { ExpressionOrColumn, ExpressionOrValue, Utils, ValueType, ValueTypeToParse } from "./../core/utils";
import { QueryCompilable } from "../core/query-compilable";
import { WhereCompiled } from "./where-compiled";
import { Condition } from "./enums/condition";
import { LambdaMetadata } from "../core/lambda-metadata";
import { DatabaseBuilderError } from "../core/errors";
import { WhereBaseBuilderContract } from "./where-base-builder-contract";
import { ColumnParams } from "../core/column-params";

export abstract class WhereBaseBuilder<
    T,
    TExpression,
    TWhere extends WhereBaseBuilder<T, TExpression, TWhere>
    > implements WhereBaseBuilderContract<T, TExpression, TWhere> {

    private static readonly AND: string = "AND";
    private static readonly OR: string = "OR";

    private _where: string = "";
    private readonly _params: ValueType[] = [];

    private _pendingConditions: Condition[] = [];
    private _pendingAndOr: string = WhereBaseBuilder.AND;

    private readonly _databaseHelper: DatabaseHelper;

    constructor(
        private _typeT: new () => T,
        private _alias: string
    ) {
        this._databaseHelper = new DatabaseHelper();
    }

    public eq(
        expression1: TExpression,
        expression2: TExpression
    ): TWhere {
        this.buildWhereWithExpressionOrValue(
            [Condition.Equal],
            expression1,
            expression2);
        return this._getInstance();
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

    public containsValue(
        expression: TExpression,
        value: string
    ): TWhere {
        return this.likeValue(expression, `%${value}%`);
    }

    public startsWithValue(
        expression: TExpression,
        value: string,
    ): TWhere {
        return this.likeValue(expression, `${value}%`);
    }

    public endsWithValue(
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
        expression2: TExpression,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.LessAndEqual],
            this.getColumnParams(expression1),
            this.getColumnParams(expression2)
        );
        return this._getInstance();
    }

    public betweenValue(
        expression: TExpression,
        value1: ValueTypeToParse,
        value2: ValueTypeToParse,
    ): TWhere {
        this.buildWhereColumn(
            [Condition.Between],
            this.getColumnParams(expression),
            [value1, value2]);
        return this._getInstance();
    }

    public inValues(
        expression: TExpression,
        values: ValueTypeToParse[],
    ): TWhere {
        this.buildWhereColumn(
            [Condition.In],
            this.getColumnParams(expression),
            values);
        return this._getInstance();
    }

    public inSelect(
        expression: TExpression,
        query: QueryCompilable,
    ): TWhere {
        const compiled = query.compile();
        this.buildWhereColumn(
            [Condition.In],
            this.getColumnParams(expression),
            compiled.query);
        this.addParam(compiled.params);
        return this._getInstance();
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
        right: ColumnParams | string | ValueTypeToParse[],
        left: ColumnParams | string | ValueTypeToParse[],
    ) {
        const columnRight = this.processParam(right);
        const columnLeft = this.processParam(left);
        this.buildWhereParams(
            condition,
            this.addAlias(columnRight.column),
            this.addAlias(columnLeft.column),
            columnRight.params.concat(columnLeft.params)
        );
    }

    protected buildWhereParams(
        condition: Condition[],
        column1: string,
        column2: string,
        params: ValueTypeToParse[]
    ) {
        this.buildWhere(condition,
            column1,
            column2
        );
        this.addParam(params);
    }

    protected buildWhere(
        conditions: Condition[],
        column1: string,
        column2: string | string[],
    ) {
        this.checkWhere();
        this._where += this.createWhere(conditions, column1, column2);
    }

    protected addAlias(
        column: string,
    ): string {
        if (column && this._alias && Utils.isNameColumn(column)) {
            return `${this._alias}.${column}`;
        }
        return column;
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
        if (param === void 0) {
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
                result.column += "?";
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
        if (Utils.isValue(metadata.left)) {
            this.addParam(metadata.left);
            metadata.left = "?";
        }
        if (Utils.isValue(metadata.right)) {
            this.addParam(metadata.right);
            metadata.right = "?";
        }
        this.buildWhere(metadata.condition, this.addAlias(metadata.left), this.addAlias(metadata.right));
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
        column1: string,
        column2: string | string[],
    ) {
        const conditionsArray = this._pendingConditions.concat(conditions);
        this._pendingConditions = [];
        return this.buildConditions(conditionsArray, column1, column2);
    }

    private buildConditions(
        conditions: Condition[],
        column1: string,
        column2: string | string[],
    ): string {
        // new scope
        if (!conditions || (conditions.length === 1 && conditions[0] === void 0)) {
            return `(${column1})`;
        }
        switch (conditions.toString()) {
            case [Condition.Between].toString():
            case [Condition.Not, Condition.Between].toString():
                // ${column} BETWEEN ? AND ?
                if (column2.length === 2) {
                    return `${column1} ${this.builderConditions(conditions)} ${column2[0]} ${WhereBaseBuilder.AND} ${column2[1]}`;
                }
                throw new DatabaseBuilderError(`Length (${column2.length}) parameter to '${conditions}' condition incorrect!`);
            case [Condition.In].toString():
            case [Condition.Not, Condition.In].toString():
                // ${column} IN (?, ?, ...)
                return `${column1} ${this.builderConditions(conditions)} (${column2})`.trim();
            case [Condition.Not, Condition.IsNull].toString():
                return `${column1} IS NOT NULL`.trim();
            case [Condition.Not, Condition.Equal].toString():
                return `${column1} <> ${column2}`.trim();
            case [Condition.Not, Condition.Great].toString():
                return this.buildConditions([Condition.LessAndEqual], column1, column2);
            case [Condition.Not, Condition.GreatAndEqual].toString():
                return this.buildConditions([Condition.Less], column1, column2);
            case [Condition.Not, Condition.Less].toString():
                return this.buildConditions([Condition.GreatAndEqual], column1, column2);
            case [Condition.Not, Condition.LessAndEqual].toString():
                return this.buildConditions([Condition.Great], column1, column2);
            default:
                if (column2) {
                    return `${column1} ${this.builderConditions(conditions)} ${column2}`.trim();
                }
                return `${column1} ${this.builderConditions(conditions)}`.trim();
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