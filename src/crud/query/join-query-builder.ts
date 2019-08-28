import { ProjectionCompiled } from "../projection-compiled";
import { ProjectionBuilder } from "../projection-builder";
import { JoinQueryBuilderContract } from "./join-query-builder-contract";
import { WhereCompiled } from "../where-compiled";
import { WhereBuilder } from "../where-builder";
import { QueryBuilderBase } from "./query-builder-base";
import { JoinType } from "../enums/join-type";
import { ParamType, ValueType } from "../../core/utils";
import { MapperTable } from "../../mapper-table";
import { MetadataTable } from "../../metadata-table";
import { QueryBuilder } from "./query-builder";
import { ProjectionModel } from "../projection-model";

export class JoinQueryBuilder<T>
    extends QueryBuilderBase<T, JoinQueryBuilder<T>>
    implements JoinQueryBuilderContract<T, JoinQueryBuilder<T>> {

    private readonly _on: WhereBuilder<T>;

    constructor(
        queryT: (new () => T) | QueryBuilder<T>,
        onWhereCallback: (where: WhereBuilder<T>) => void,
        mapperTable: MapperTable,
        private _typeJoin: JoinType = JoinType.LEFT,
        alias: string = void 0,
        getMapper?: (tKey: (new () => any) | string) => MetadataTable<any>,
        ignoreQueryFilters: boolean = true
    ) {
        super(queryT, mapperTable, alias, getMapper);

        this._ignoreQueryFilter = ignoreQueryFilters;
        this._on = new WhereBuilder<T>(void 0, this.alias);
        onWhereCallback(this._on);
    }

    protected _getInstance(): JoinQueryBuilder<T> {
        return this;
    }

    public _getOn(): WhereCompiled {
        return this.whereCompile(this._on.compile());
    }

    public _getTypeJoin(): string {
        return this._typeJoin;
    }

    public _getWhere(): WhereCompiled {
        // return this.whereCompile();
        return this.whereCompiled;
    }

    public _getProjections(): ProjectionModel[] {
        return this._projections;
    }
    // public _getSelect(): ProjectionCompiled {
    //     return this._projectionCompiled;
    // }

    public _getGroupBy(): string {
        return this._groupBy;
    }

    public _getHaving(): WhereCompiled {
        return this._having;
    }

    public _getOrderBy(): string {
        return this._orderBy;
    }

    public _getParams(): ParamType[] {
        return this._joinParams;
    }

    public addParamsOn(params: ValueType[]): JoinQueryBuilder<T> {
        this._on._addParams(params);
        return this;
    }

    // Para adicionar alias da tabela no apelido da projeção padrão
    protected createProjectionBuilder(): ProjectionBuilder<T> {
        return super.createProjectionBuilder(true, void 0);
    }

    // default false para não adicionar comandos em expressões em join,
    // ao adicionar o join na consulta principal que será verificado se o commando deve ser adicionado
    protected compileWhere(current: WhereCompiled, compiled: WhereCompiled, addCommand: boolean = false) {
        super.compileWhere(current, compiled, addCommand);
    }

    // default false para não adicionar comandos em expressões em join,
    // ao adicionar o join na consulta principal que será verificado se o commando deve ser adicionado
    protected compileGroupBy(groupBy: string, addCommand: boolean = false) {
        super.compileGroupBy(groupBy, addCommand);
    }

    // default false para não adicionar comandos em expressões em join,
    // ao adicionar o join na consulta principal que será verificado se o commando deve ser adicionado
    protected compileHaving(having: WhereCompiled, addCommand: boolean = false) {
        super.compileHaving(having, addCommand);
    }

    // default false para não adicionar comandos em expressões em join,
    // ao adicionar o join na consulta principal que será verificado se o commando deve ser adicionado
    protected compileOrderBy(orderBy: string, addCommand: boolean = false) {
        super.compileOrderBy(orderBy, addCommand);
    }
}
