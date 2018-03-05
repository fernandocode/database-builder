import { QueryBuilderBaseContract } from "./query-builder-base-contract";
import { JoinType, WhereBuilder } from "..";
import { JoinQueryBuilder } from "./join-query-builder";

export interface QueryBuilderContract<T, TQuery extends QueryBuilderContract<T, TQuery>>
    extends QueryBuilderBaseContract<T, TQuery> {

    limit(limit: number): TQuery;

    join<TJoin>(
        typeTJoin: new () => TJoin,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type?: JoinType,
        alias?: string): TQuery;
}
