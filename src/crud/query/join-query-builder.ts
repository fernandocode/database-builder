import { QueryBuilder } from "./query-builder";
import { WhereBuilder } from "../where-builder";
import { JoinType } from "../enums/join-type";

export class JoinQueryBuilder<T> extends QueryBuilder<T> {
    private readonly _onWhere: WhereBuilder<T>;
    public get onWhere(): WhereBuilder<T> {
        return this._onWhere;
    }

    constructor(
        typeT: new () => T,
        onWhereCallback: (where: WhereBuilder<T>) => void,
        public type: JoinType = JoinType.LEFT,
        alias: string = void 0,
        enableLog: boolean = true,
    ) {
        super(typeT, alias, enableLog);

        this._onWhere = new WhereBuilder(typeT, this.alias);
        onWhereCallback(this._onWhere);
    }

    public join<TJoin>(
        typeTJoin: new () => TJoin,
        onWhereCallback: (where: WhereBuilder<TJoin>) => void,
        joinCallback: (joinQuery: JoinQueryBuilder<TJoin>) => void,
    ): QueryBuilder<T> {
        throw new Error("Not allowed to add a join inside another join. Please add the joins only in the root query.");
    }

    public limit(
        limit: number,
    ): QueryBuilder<T> {
        throw new Error("Not allowed to specify limit in join query.");
    }
}
