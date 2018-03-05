import { WhereBuilder } from "../where-builder";
import { JoinType } from "../enums/join-type";
import { JoinQueryBuilder } from "./join-query-builder";
import { QueryBuilderBase } from "./query-builder-base";
import { QueryBuilderContract } from "./query-builder-contract";

export class QueryBuilder<T>
    extends QueryBuilderBase<T, QueryBuilder<T>>
    implements QueryBuilderContract<T, QueryBuilder<T>> {

    private readonly OFFSET = "OFFSET";

    protected _getInstance(): QueryBuilder<T> {
        return this;
    }

    public join<TJoin>(
        typeTJoin: new () => TJoin,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0
    ): QueryBuilder<T> {
        const instanceJoin: JoinQueryBuilder<TJoin> = new JoinQueryBuilder(typeTJoin, onWhereCallback, type, alias);
        joinCallback(instanceJoin);
        this.addJoin(instanceJoin);
        return this._getInstance();
    }

    public limit(limit: number, offset?: number): QueryBuilder<T> {
        this._limit.builder = " ?";
        this._limit.params = [limit];
        if (offset) {
            this._limit.builder += ` ${this.OFFSET} ?`;
            this._limit.params.push(offset);
        }
        return this._getInstance();
    }
}
