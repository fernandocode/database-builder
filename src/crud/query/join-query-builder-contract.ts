import { ProjectionCompiled } from "./../projection-compiled";
import { QueryBuilderBaseContract } from "./query-builder-base-contract";
import { WhereCompiled } from "../where-compiled";

export interface JoinQueryBuilderContract<T, TQuery extends JoinQueryBuilderContract<T, TQuery>>
    extends QueryBuilderBaseContract<T, TQuery> {

    _getOn(): WhereCompiled;
    _getTypeJoin(): string;
    _getWhere(): WhereCompiled;
    _getSelect(): ProjectionCompiled;
    _getGroupBy(): string;
    _getHaving(): WhereCompiled;
    _getOrderBy(): string;
}
