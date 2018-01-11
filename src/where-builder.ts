import { DatabaseHelper } from './database-helper';
import { Expression, ExpressionUtils } from 'lambda-expression';
import { ValueType, IQueryCompilable, ValueTypeToParse } from "./utils";

// TODO: add LambdaExpression support in WhereBuilder
export class WhereBuilder<T> {

    private static readonly AND: string = "AND";
    private static readonly OR: string = "OR";

    private _where: string = "";
    private readonly _params: ValueType[] = [];

    private _pendingCondition: Condition = void 0;
    private _pendingAndOr: string = WhereBuilder.AND;

    private readonly _expressionUtils: ExpressionUtils;
    private readonly _databaseHelper: DatabaseHelper;

    constructor(
        private _typeT: new () => T,
        private _alias: string
    ) {
        this._expressionUtils = new ExpressionUtils();
        this._databaseHelper = new DatabaseHelper();
    }

    public not(): WhereBuilder<T> {
        this._pendingCondition = Condition.Not;
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

    public scope(scopeCallback: (scope: WhereBuilder<T>) => void): WhereBuilder<T> {
        let instanceScope: WhereBuilder<T> = new WhereBuilder(this._typeT, this._alias);
        scopeCallback(instanceScope);
        this.compileScope(instanceScope.compile());
        return this;
    }

    public equalColumn(expression: Expression<T>, column: string): WhereBuilder<T> {
        this.buildWhere(
            Condition.Equal,
            this.addAlias(this._expressionUtils.getColumnByExpression(expression)),
            column
        );
        return this;
    }

    public equalValue(expression: Expression<T>, value: ValueTypeToParse): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Equal,
            expression,
            value);
        return this;
    }

    public equal(expression1: Expression<T>, expression2: Expression<T>): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.Equal,
            expression1,
            expression2);
        return this;
    }

    public isNull(expression1: Expression<T>): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.IsNull,
            expression1,
            void 0
        );
        return this;
    }

    public greatValue(expression: Expression<T>, value: ValueTypeToParse): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Great,
            expression,
            value);
        return this;
    }

    public great(expression1: Expression<T>, expression2: Expression<T>): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.Great,
            expression1,
            expression2);
        return this;
    }

    public greatAndEqualValue(expression: Expression<T>, value: ValueTypeToParse): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.GreatAndEqual,
            expression,
            value);
        return this;
    }

    public greatAndEqual(expression1: Expression<T>, expression2: Expression<T>): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.GreatAndEqual,
            expression1,
            expression2);
        return this;
    }

    public lessValue(expression: Expression<T>, value: ValueTypeToParse): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Less,
            expression,
            value);
        return this;
    }

    public less(expression1: Expression<T>, expression2: Expression<T>): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.Less,
            expression1,
            expression2);
        return this;
    }

    public lessAndEqualValue(expression: Expression<T>, value: ValueTypeToParse): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.LessAndEqual,
            expression,
            value);
        return this;
    }

    public lessAndEqual(expression1: Expression<T>, expression2: Expression<T>): WhereBuilder<T> {
        this.buildWhereWithExpression(
            Condition.LessAndEqual,
            expression1,
            expression2);
        return this;
    }

    public betweenValue(expression: Expression<T>, value1: ValueTypeToParse, value2: ValueTypeToParse): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.Between,
            expression,
            [value1, value2]);
        return this;
    }

    public inValues(expression: Expression<T>, values: ValueTypeToParse[]): WhereBuilder<T> {
        this.buildWhereWithExpressionWithParameter(
            Condition.In,
            expression,
            values);
        return this;
    }

    public inSelect(expression: Expression<T>, query: IQueryCompilable): WhereBuilder<T> {
        let compiled = query.compile();
        this.buildWhere(
            Condition.In,
            this.addAlias(this._expressionUtils.getColumnByExpression(expression)),
            compiled.query);
        this.addParam(compiled.params);
        return this;
    }

    public compile(): WhereCompiled {
        return {
            where: this._where,
            params: this._params
        }
    }

    private addParam(param: ValueTypeToParse | ValueTypeToParse[]) {
        if (Array.isArray(param)) {
            param.forEach((value) => {
                this.addValueParam(value);
            });
        } else {
            this.addValueParam(param);
        }
    }

    private addValueParam(param: ValueTypeToParse) {
        this._params.push(
            this._databaseHelper.parseToValueType(param)
        );
    }

    private buildWhereWithExpressionWithParameter<T>(condition: Condition, expression: Expression<T>, param: ValueTypeToParse | ValueTypeToParse[]) {
        this.buildWhereWithParameter(condition, this._expressionUtils.getColumnByExpression(expression), param);
    }

    private buildWhereWithParameter(condition: Condition, column: string, param: ValueTypeToParse | ValueTypeToParse[]) {
        let column2: string | string[] = "?";
        if (Array.isArray(param)) {
            column2 = [];
            param.forEach(() => {
                (<string[]>column2).push("?");
            });
        }
        this.buildWhere(condition, this.addAlias(column), column2);
        this.addParam(param);
    }

    private addAlias(column: string): string {
        if (this._alias) {
            return `${this._alias}.${column}`;
        }
        return column;
    }

    private buildWhereWithExpression(condition: Condition, expression1: Expression<T>, expression2: Expression<T>) {
        this.buildWhere(condition,
            this._expressionUtils.getColumnByExpression(expression1),
            expression2 ? this._expressionUtils.getColumnByExpression(expression2) : void 0
        );
    }

    private buildWhere(condition: Condition, column1: string, column2: string | string[]) {
        this.checkWhere();
        this._where += this.createWhere(condition, column1, column2);
    }

    private createWhere(condition: Condition, column1: string, column2: string | string[]) {
        let pendingCondition = this._pendingCondition;
        this._pendingCondition = void 0;
        let appendCondition = this.checkAppendPendingCondition(condition, pendingCondition);
        if (appendCondition.appended) {
            return this.buildCondition(<Condition>appendCondition.condition, column1, column2);
        }
        return `${pendingCondition}(${this.buildCondition(<Condition>appendCondition.condition, column1, column2)})`;
    }

    private buildCondition(condition: Condition, column1: string, column2: string | string[]) {
        // new scope
        if (!condition) {
            return `(${column1})`;
        }
        switch (condition) {
            case Condition.Between:
                // ${column} BETWEEN ? AND ?
                if (column2.length == 2) {
                    return `${column1} ${condition} ${column2[0]} ${WhereBuilder.AND} ${column2[0]}`;
                }
                throw `Length (${column2.length}) parameter to '${condition}' condition incorrect!`;
            case Condition.In:
            case this.buildConditionNotIn():
                // ${column} IN (?, ?, ...)
                return `${column1} ${condition} (${column2})`.trim();
            default:
                if (column2) {
                    return `${column1} ${condition} ${column2}`.trim();
                }
                return `${column1} ${condition}`.trim();
        }
    }

    private checkWhere() {
        this._where += this._where.length ? ` ${this._pendingAndOr} ` : "";
        this._pendingAndOr = WhereBuilder.AND;
    }

    private buildConditionNotIn() {
        return `${Condition.Not} ${Condition.In}`;
    }

    private checkAppendPendingCondition(condition: Condition, pendingCondition: Condition)
        : { condition: string, appended: boolean } {
        if (!pendingCondition) {
            return {
                condition: condition,
                appended: true
            }
        }
        else if (pendingCondition == Condition.Not) {
            switch (condition) {
                case Condition.Equal:
                    return {
                        condition: "<>",
                        appended: true
                    }
                case Condition.Great:
                    return {
                        condition: Condition.LessAndEqual,
                        appended: true
                    }
                case Condition.GreatAndEqual:
                    return {
                        condition: Condition.Less,
                        appended: true
                    }
                case Condition.IsNull:
                    return {
                        condition: "IS NOT NULL",
                        appended: true
                    }
                case Condition.Less:
                    return {
                        condition: Condition.GreatAndEqual,
                        appended: true
                    }
                case Condition.LessAndEqual:
                    return {
                        condition: Condition.Great,
                        appended: true
                    }
                case Condition.In:
                    return {
                        condition: this.buildConditionNotIn(),
                        appended: true
                    }
                case Condition.Not:
                    throw "Not condition unavaliable to 'Not' pre condition";
                case Condition.Between:
                default:
                    return {
                        condition: condition,
                        appended: false
                    }
            }
        }
        throw `Pre condition ${condition} not supported`;
    }

    private compileScope(compiled: WhereCompiled) {
        this.buildWhereWithParameter(void 0, compiled.where, compiled.params)
    }
}

export interface WhereCompiled {
    where: string;
    params: ValueType[];
}

export enum Condition {
    Not = "NOT",
    IsNull = "IS NULL",
    Equal = "=",
    Great = ">",
    Less = "<",
    GreatAndEqual = ">=",
    LessAndEqual = "<=",
    Between = "BETWEEN",
    In = "IN"
}