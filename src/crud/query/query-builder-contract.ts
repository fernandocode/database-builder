import { QueryBuilderBaseContract } from "./query-builder-base-contract";
import { JoinQueryBuilder } from "./join-query-builder";
import { WhereBuilder } from "../where-builder";
import { JoinType } from "../enums/join-type";

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
