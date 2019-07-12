import { ColumnRef } from "../../core/column-ref";
import { ExpressionOrColumn, ParamType } from "../../core/utils";
import { LambdaExpression } from "lambda-expression";
import { ProjectionBuilder } from "../projection-builder";
import { OrderBy } from "../../core/enums/order-by";
import { UnionType } from "../../core/union-type";
import { QueryCompiled } from "../../core/query-compiled";
import { WhereBuilder } from "../where-builder";
import { SqlCompilable } from "../sql-compilable";

export interface QueryBuilderBaseContract<T, TQuery extends QueryBuilderBaseContract<T, TQuery>> {

    alias: string;

    tablename: string;

    clone(): TQuery;

    ref<TReturn>(expression: ExpressionOrColumn<TReturn, T>): ColumnRef;

    hasAlias(alias: string): boolean;

    getAlias(tKey: (new () => any) | string): string;

    from(query: QueryCompiled[] | SqlCompilable): TQuery;

    createWhere(): WhereBuilder<T>;

    where(whereCallback: (where: WhereBuilder<T>) => void): TQuery;

    whereExp(expression: LambdaExpression<T>): TQuery;

    projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): TQuery;

    select<TReturn>(...expressions: Array<ExpressionOrColumn<TReturn, T>>): TQuery;

    orderBy<TReturn>(expression: ExpressionOrColumn<TReturn, T>, order?: OrderBy): TQuery;

    asc<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TQuery;

    desc<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TQuery;

    // TODO: suportar expressão having: https://sqlite.org/lang_select.html
    groupBy<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TQuery;

    union(query: QueryCompiled[] | SqlCompilable, type?: UnionType): TQuery;

    unionAll(query: QueryCompiled[] | SqlCompilable): TQuery;

    /**
     * ignore query filters in query
     * use in the beginning of a query so that the posterior joins are applied
     */
    ignoreQueryFilters(): TQuery;

    setParamsQueryFilter(params: { [s: string]: ParamType }): TQuery;

    compileTable(): string;
}
