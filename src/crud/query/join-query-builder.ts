import { ProjectionBuilder } from "../projection-builder";
import { QueryBuilderBase } from "./query-builder-base";
import { JoinQueryBuilderContract } from "./join-query-builder-contract";
import { WhereCompiled } from "../where-compiled";
import { WhereBuilder } from "../where-builder";
import { ProjectionCompiled } from "../projection-compiled";
import { JoinType } from "../enums/join-type";
import { ValueType } from "../../core/utils";

export class JoinQueryBuilder<T>
    extends QueryBuilderBase<T, JoinQueryBuilder<T>>
    implements JoinQueryBuilderContract<T, JoinQueryBuilder<T>> {

    private readonly _on: WhereBuilder<T>;

    protected _getInstance(): JoinQueryBuilder<T> {
        return this;
    }

    public _getOn(): WhereCompiled {
        return this._on.compile();
    }

    public _getTypeJoin(): string {
        return this._typeJoin;
    }

    public _getWhere(): WhereCompiled {
        return this._whereCompiled;
    }

    public _getSelect(): ProjectionCompiled {
        return this._projectionCompiled;
    }

    public _getGroupBy(): string {
        return this._groupBy;
    }

    public _getHaving(): WhereCompiled {
        return this._having;
    }

    public _getOrderBy(): string {
        return this._orderBy;
    }

    public addParamsOn(params: ValueType[]): JoinQueryBuilder<T> {
        this._on._addParams(params);
        return this;
    }

    constructor(
        typeT: new () => T,
        onWhereCallback: (where: WhereBuilder<T>) => void,
        private _typeJoin: JoinType = JoinType.LEFT,
        alias: string = void 0,
        enableLog: boolean = true,
    ) {
        super(typeT, alias, enableLog);

        this._on = new WhereBuilder(typeT, this.alias);
        onWhereCallback(this._on);
    }

    // Para adicionar alias da tabela no apelido da projeção padrão
    protected createProjectionBuilder(): ProjectionBuilder<T> {
        return new ProjectionBuilder(this._typeT, this.alias, true);
    }
}
