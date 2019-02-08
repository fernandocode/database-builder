import { WhereBuilder } from "../where-builder";
import { JoinType } from "../enums/join-type";
import { JoinQueryBuilder } from "./join-query-builder";
import { QueryBuilderBase } from "./query-builder-base";
import { QueryBuilderContract } from "./query-builder-contract";
import { MapperTable } from "../../mapper-table";
import { Utils } from "../../core/utils";

export class QueryBuilder<T>
    extends QueryBuilderBase<T, QueryBuilder<T>>
    implements QueryBuilderContract<T, QueryBuilder<T>> {

    protected _getInstance(): QueryBuilder<T> {
        return this;
    }

    public join<TJoin>(
        typeTJoin: (new () => TJoin) | QueryBuilder<TJoin>,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
        mapperTable: MapperTable,
        type: JoinType = JoinType.LEFT,
        alias: string = void 0
    ): QueryBuilder<T> {
        if(Utils.isQueryBuilder(typeTJoin)){
            this.innerUsedAliasTest.push((typeTJoin as QueryBuilder<TJoin>))
        }
        const instanceJoin: JoinQueryBuilder<TJoin> = new JoinQueryBuilder(
            typeTJoin, onWhereCallback, mapperTable, type,
            this.createAlias(alias, this.createTablename(
                Utils.isQueryBuilder(typeTJoin)
                    ? void 0
                    : typeTJoin as (new () => TJoin), mapperTable)
            ), this._getMapper);
        joinCallback(instanceJoin);
        this.addJoin(instanceJoin);
        return this._getInstance();
    }
}
