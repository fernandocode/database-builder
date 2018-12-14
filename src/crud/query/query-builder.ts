import { WhereBuilder } from "../where-builder";
import { JoinType } from "../enums/join-type";
import { JoinQueryBuilder } from "./join-query-builder";
import { QueryBuilderBase } from "./query-builder-base";
import { QueryBuilderContract } from "./query-builder-contract";
import { MapperTable } from "../../mapper-table";

export class QueryBuilder<T>
    extends QueryBuilderBase<T, QueryBuilder<T>>
    implements QueryBuilderContract<T, QueryBuilder<T>> {

    protected _getInstance(): QueryBuilder<T> {
        return this;
    }

    public join<TJoin>(
        typeTJoin: new () => TJoin,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        mapperTable: MapperTable,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0
    ): QueryBuilder<T> {
        const instanceJoin: JoinQueryBuilder<TJoin> = new JoinQueryBuilder(
            typeTJoin, onWhereCallback, mapperTable, type, alias, this._getMapper);
        joinCallback(instanceJoin);
        this.addJoin(instanceJoin);
        return this._getInstance();
    }
}
