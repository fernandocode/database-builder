import { ColumnRef } from "./../../core/column-ref";
import { QueryCompilable } from "../../core/query-compilable";
import { ExpressionOrColumn } from "../../core/utils";
import { Database, QueryCompiled, ResultExecuteSql } from "../..";
import { WhereBuilder } from "..";
import { LambdaExpression } from "lambda-expression";
import { ProjectionBuilder } from "../projection-builder";
import { OrderBy } from "../../core/enums/order-by";

export interface QueryBuilderBaseContract<T, TQuery extends QueryBuilderBaseContract<T, TQuery>> extends QueryCompilable {

    alias: string;

    clone(): TQuery;

    // ref(expression: ExpressionOrColumn<T>): string;
    ref2(expression: ExpressionOrColumn<T>): ColumnRef;

    hasAlias(alias: string): boolean;

    from(query: QueryCompiled): TQuery;

    createWhere(): WhereBuilder<T>;

    where(whereCallback: (where: WhereBuilder<T>) => void): TQuery;

    whereExp(expression: LambdaExpression<T>): TQuery;

    /**
     * @deprecated Use `select`
     * @param projectionCallback
     */
    projection(projectionCallback: (projection: ProjectionBuilder<T>) => void): TQuery;

    select(selectCallback: (select: ProjectionBuilder<T>) => void): TQuery;

    orderBy(expression: ExpressionOrColumn<T>, order?: OrderBy): TQuery;

    asc(expression: ExpressionOrColumn<T>): TQuery;

    desc(expression: ExpressionOrColumn<T>): TQuery;

    // TODO: suportar expressão having: https://sqlite.org/lang_select.html
    groupBy(expression: ExpressionOrColumn<T>): TQuery;

    union(query: QueryCompiled): TQuery;

    execute(database: Database): Promise<ResultExecuteSql>;

    compileTable(): string;

    compile(): QueryCompiled;
}
