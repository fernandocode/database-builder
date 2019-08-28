import { QueryBuilderBaseContract } from "./query-builder-base-contract";
import { WhereCompiled } from "../where-compiled";
import { ParamType } from "../../core/utils";
import { ProjectionModel } from "../projection-model";

export interface JoinQueryBuilderContract<T, TQuery extends JoinQueryBuilderContract<T, TQuery>>
    extends QueryBuilderBaseContract<T, TQuery> {

    _getOn(): WhereCompiled;
    _getTypeJoin(): string;
    _getWhere(): WhereCompiled;
    _getProjections(): ProjectionModel[];
    // _getSelect(): ProjectionCompiled;
    _getGroupBy(): string;
    _getHaving(): WhereCompiled;
    _getOrderBy(): string;
    _getParams(): ParamType[];
}
