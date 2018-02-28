import { DatabaseHelper } from "./../database-helper";
import { Expression, ExpressionUtils, LambdaExpression } from "lambda-expression";
import { ExpressionOrColumn, Utils, ValueType, ValueTypeToParse } from "./../core/utils";
import { QueryCompilable } from "../core/query-compilable";
import { WhereCompiled } from "./where-compiled";
import { Condition } from "./enums/condition";
import { LambdaMetadata } from "../core/lambda-metadata";

// TODO: add LambdaExpression support in WhereBuilder
export class WhereBuilder<T> {

    private static readonly AND: string = "AND";
    private static readonly OR: string = "OR";

    private _where: string = "";
    private readonly _params: ValueType[] = [];

    private _pendingConditions: Condition[] = [];
    // private _pendingCondition: Condition = void 0;
    private _pendingAndOr: string = WhereBuilder.AND;

    private readonly _databaseHelper: DatabaseHelper;

    constructor(
        private _typeT: new () => T,
        private _alias: string,
    ) {
        this._databaseHelper = new DatabaseHelper();
    }

    public not(): WhereBuilder<T> {
        this._pendingConditions.push(Condition.Not);
        // this._pendingCondition = Condition.Not;
        return this;
    }

    public and(): WhereBuilder<T> {
        this._pendingAndOr = WhereBuilder.AND;
        return this;
    }

    public or(): WhereBuilder<T> {
        this._pendingAndOr = WhereBuilder.OR;
        return this;
    }

    public scope(
        scopeCallback: (scope: WhereBuilder<T>) => void,
    ): WhereBuilder<T> {
        const instanceScope: WhereBuilder<T> = new WhereBuilder(this._typeT, this._alias);
        scopeCallback(instanceScope);
        this.compileScope(instanceScope.compile());
        return this;
    }

    /**
     * @deprecated Use `equal`
     * @param expression
     * @param column
     */
    public equalColumn(
        expression: ExpressionOrColumn<T>,
        column: string,
    ): WhereBuilder<T> {
        this.buildWhere(
            [Condition.Equal],
            this.addAlias(Utils.getColumn(expression)),
            column,
        );
        return this;
    }

    public equalValue(
        expression: ExpressionOrColumn<T>,
        value: ValueTypeToParse,
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Equal,
            expression,
            value);
        return this;
    }

    public equal(
        expression1: ExpressionOrColumn<T>,
        expression2: ExpressionOrColumn<T>,
    ): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.Equal,
            expression1,
            expression2);
        return this;
    }

    public isNull(
        expression1: ExpressionOrColumn<T>,
    ): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.IsNull,
            expression1,
            void 0,
        );
        return this;
    }

    public greatValue(
        expression: ExpressionOrColumn<T>,
        value: ValueTypeToParse,
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Great,
            expression,
            value);
        return this;
    }

    public great(
        expression1: ExpressionOrColumn<T>,
        expression2: ExpressionOrColumn<T>,
    ): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.Great,
            expression1,
            expression2);
        return this;
    }

    public greatAndEqualValue(
        expression: ExpressionOrColumn<T>,
        value: ValueTypeToParse,
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.GreatAndEqual,
            expression,
            value);
        return this;
    }

    public greatAndEqual(
        expression1: ExpressionOrColumn<T>,
        expression2: ExpressionOrColumn<T>,
    ): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.GreatAndEqual,
            expression1,
            expression2);
        return this;
    }

    public lessValue(
        expression: ExpressionOrColumn<T>,
        value: ValueTypeToParse,
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Less,
            expression,
            value);
        return this;
    }

    public less(
        expression1: ExpressionOrColumn<T>,
        expression2: ExpressionOrColumn<T>,
    ): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.Less,
            expression1,
            expression2);
        return this;
    }

    public lessAndEqualValue(
        expression: ExpressionOrColumn<T>,
        value: ValueTypeToParse,
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.LessAndEqual,
            expression,
            value);
        return this;
    }

    public lessAndEqual(
        expression1: ExpressionOrColumn<T>,
        expression2: ExpressionOrColumn<T>,
    ): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.LessAndEqual,
            expression1,
            expression2);
        return this;
    }

    public betweenValue(
        expression: ExpressionOrColumn<T>,
        value1: ValueTypeToParse,
        value2: ValueTypeToParse,
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Between,
            expression,
            [value1, value2]);
        return this;
    }

    public inValues(
        expression: ExpressionOrColumn<T>,
        values: ValueTypeToParse[],
    ): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.In,
            expression,
            values);
        return this;
    }

    public inSelect(
        expression: ExpressionOrColumn<T>,
        query: QueryCompilable,
    ): WhereBuilder<T> {
        const compiled = query.compile();
        this.buildWhere(
            [Condition.In],
            this.addAlias(Utils.getColumn(expression)),
            compiled.query);
        this.addParam(compiled.params);
        return this;
    }

    public compile(): WhereCompiled {
        return {
            params: this._params,
            where: this._where,
        };
    }

    public expression(expression: LambdaExpression<T>): WhereBuilder<T> {
        const metadata = Utils.getLambdaMetadata(expression);
        this.buildWhereMetadata(metadata);
        return this;
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

    private addParam(
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

    private addValueParam(
        param: ValueTypeToParse,
    ) {
        this._params.push(
            this._databaseHelper.parseToValueType(Utils.clearParam(param)),
            // this._databaseHelper.parseToValueType(param),
        );
    }

    private buildWhereWithExpressionWithParameter(
        condition: Condition,
        expression: ExpressionOrColumn<T>,
        param: ValueTypeToParse | ValueTypeToParse[],
    ) {
        this.buildWhereWithParameter(condition, Utils.getColumn(expression), param);
    }

    private buildWhereWithParameter(
        condition: Condition,
        column: string,
        param: ValueTypeToParse | ValueTypeToParse[],
    ) {
        let column2: string | string[] = "?";
        if (Array.isArray(param)) {
            column2 = [];
            param.forEach(() => {
                (column2 as string[]).push("?");
            });
        }
        this.buildWhere([condition], this.addAlias(column), column2);
        this.addParam(param);
    }

    private addAlias(
        column: string,
    ): string {
        if (this._alias && Utils.isNameColumn(column)) {
            return `${this._alias}.${column}`;
        }
        return column;
    }

    private buildWhereWithExpression(
        condition: Condition,
        expression1: ExpressionOrColumn<T>,
        expression2: ExpressionOrColumn<T>,
    ) {
        this.buildWhere([condition],
            this.addAlias(Utils.getColumn(expression1)),
            expression2 ? this.addAlias(Utils.getColumn(expression2)) : void 0,
        );
    }

    private buildWhere(
        conditions: Condition[],
        column1: string,
        column2: string | string[],
    ) {
        this.checkWhere();
        this._where += this.createWhere(conditions, column1, column2);
    }
    // private buildWhere(
    //     condition: Condition,
    //     column1: string,
    //     column2: string | string[],
    // ) {
    //     this.checkWhere();
    //     this._where += this.createWhere(condition, column1, column2);
    // }

    private createWhere(
        conditions: Condition[],
        column1: string,
        column2: string | string[],
    ) {
        const conditionsArray = this._pendingConditions.concat(conditions);
        this._pendingConditions = [];
        return this.buildConditions(conditionsArray, column1, column2);
        // const pendingCondition = this._pendingCondition;
        // this._pendingCondition = void 0;
        // const appendCondition = this.checkAppendPendingCondition(condition, pendingCondition);
        // if (appendCondition.appended) {
        //     return this.buildCondition(appendCondition.condition as Condition, column1, column2);
        // }
        // return `${pendingCondition}(${this.buildCondition(appendCondition.condition as Condition, column1, column2)})`;
    }
    // private createWhere(
    //     condition: Condition,
    //     column1: string,
    //     column2: string | string[],
    // ) {
    //     const pendingCondition = this._pendingCondition;
    //     this._pendingCondition = void 0;
    //     const appendCondition = this.checkAppendPendingCondition(condition, pendingCondition);
    //     if (appendCondition.appended) {
    //         return this.buildCondition(appendCondition.condition as Condition, column1, column2);
    //     }
    //     return `${pendingCondition}(${this.buildCondition(appendCondition.condition as Condition, column1, column2)})`;
    // }

    // private buildCondition(
    //     condition: Condition,
    //     column1: string,
    //     column2: string | string[],
    // ) {
    //     // new scope
    //     if (!condition) {
    //         return `(${column1})`;
    //     }
    //     switch (condition) {
    //         case Condition.Between:
    //             // ${column} BETWEEN ? AND ?
    //             if (column2.length === 2) {
    //                 return `${column1} ${condition} ${column2[0]} ${WhereBuilder.AND} ${column2[0]}`;
    //             }
    //             throw new Error(`Length (${column2.length}) parameter to '${condition}' condition incorrect!`);
    //         case Condition.In:
    //         case this.buildConditionNotIn():
    //             // ${column} IN (?, ?, ...)
    //             return `${column1} ${condition} (${column2})`.trim();
    //         default:
    //             if (column2) {
    //                 return `${column1} ${condition} ${column2}`.trim();
    //             }
    //             return `${column1} ${condition}`.trim();
    //     }
    // }

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
            case[Condition.Between].toString():
            case[Condition.Not, Condition.Between].toString():
                // ${column} BETWEEN ? AND ?
                if (column2.length === 2) {
                    return `${column1} ${this.builderConditions(conditions)} ${column2[0]} ${WhereBuilder.AND} ${column2[1]}`;
                }
                throw new Error(`Length (${column2.length}) parameter to '${conditions}' condition incorrect!`);
            case[Condition.In].toString():
            case[Condition.Not, Condition.In].toString():
                // ${column} IN (?, ?, ...)
                return `${column1} ${this.builderConditions(conditions)} (${column2})`.trim();
            case[Condition.Not, Condition.IsNull].toString():
                return `${column1} IS NOT NULL`.trim();
            case[Condition.Not, Condition.Equal].toString():
                return `${column1} <> ${column2}`.trim();
            case[Condition.Not, Condition.Great].toString():
                return this.buildConditions([Condition.LessAndEqual], column1, column2);
            case[Condition.Not, Condition.GreatAndEqual].toString():
                return this.buildConditions([Condition.Less], column1, column2);
            case[Condition.Not, Condition.Less].toString():
                return this.buildConditions([Condition.GreatAndEqual], column1, column2);
            case[Condition.Not, Condition.LessAndEqual].toString():
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
        this._pendingAndOr = WhereBuilder.AND;
    }

    // private buildConditionNotIn() {
    //     return `${Condition.Not} ${Condition.In}`;
    // }

    // private checkAppendPendingCondition(
    //     condition: Condition,
    //     pendingCondition: Condition,
    // ): { condition: string, appended: boolean } {
    //     if (!pendingCondition) {
    //         return {
    //             appended: true,
    //             condition,
    //         };
    //     } else if (pendingCondition === Condition.Not) {
    //         switch (condition) {
    //             case Condition.Equal:
    //                 return {
    //                     appended: true,
    //                     condition: "<>",
    //                 };
    //             case Condition.Great:
    //                 return {
    //                     appended: true,
    //                     condition: Condition.LessAndEqual,
    //                 };
    //             case Condition.GreatAndEqual:
    //                 return {
    //                     appended: true,
    //                     condition: Condition.Less,
    //                 };
    //             case Condition.IsNull:
    //                 return {
    //                     appended: true,
    //                     condition: "IS NOT NULL",
    //                 };
    //             case Condition.Less:
    //                 return {
    //                     appended: true,
    //                     condition: Condition.GreatAndEqual,
    //                 };
    //             case Condition.LessAndEqual:
    //                 return {
    //                     appended: true,
    //                     condition: Condition.Great,
    //                 };
    //             case Condition.In:
    //                 return {
    //                     appended: true,
    //                     condition: this.buildConditionNotIn(),
    //                 };
    //             case Condition.Not:
    //                 throw new Error("Not condition unavaliable to 'Not' pre condition");
    //             case Condition.Between:
    //             default:
    //                 return {
    //                     appended: false,
    //                     condition,
    //                 };
    //         }
    //     }
    //     throw new Error(`Pre condition ${condition} not supported`);
    // }

    private compileScope(
        compiled: WhereCompiled,
    ) {
        this.buildWhereWithParameter(void 0, compiled.where, compiled.params);
    }
}
