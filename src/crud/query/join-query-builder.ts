import { ProjectionBuilder } from "../projection-builder";
import { QueryBuilderBase } from "./query-builder-base";
import { JoinQueryBuilderContract } from "./join-query-builder-contract";
import { WhereCompiled } from "../where-compiled";
import { WhereBuilder } from "../where-builder";
import { ProjectionCompiled } from "../projection-compiled";
import { JoinType } from "../enums/join-type";
import { ValueType, ParamType } from "../../core/utils";
import { MapperTable } from "../../mapper-table";
import { MetadataTable } from "../../metadata-table";
import { QueryBuilder } from "./query-builder";

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
        return this.whereCompiled;
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

    public _getParams(): ParamType[] {
        return this._joinParams;
        // const compiled: QueryCompiled = this.buildBase();
        // return compiled.params
        //     .concat(this._joinParams)
        //     .concat(this.whereCompiled.params)
        //     .concat(this._having.params)
        //     .concat(this._limit.params);
    }

    public addParamsOn(params: ValueType[]): JoinQueryBuilder<T> {
        this._on._addParams(params);
        return this;
    }

    constructor(
        queryT: (new () => T) | QueryBuilder<T>,
        onWhereCallback: (where: WhereBuilder<T>) => void,
        mapperTable: MapperTable,
        private _typeJoin: JoinType = JoinType.LEFT,
        alias: string = void 0,
        getMapper?: (tKey: (new () => any) | string) => MetadataTable<any>
    ) {
        super(queryT, mapperTable, alias, getMapper);

        this._on = new WhereBuilder<T>(void 0, this.alias);
        onWhereCallback(this._on);
    }

    // Para adicionar alias da tabela no apelido da projeção padrão
    protected createProjectionBuilder(): ProjectionBuilder<T> {
        // return new ProjectionBuilder(this._typeT, this.alias, true);
        return super.createProjectionBuilder(true, void 0);
    }

    // default false para não adicionar comandos em expressões em join,
    // ao adicionar o join na consulta principal que será verificado se o commando deve ser adicionado
    protected compileWhere(compiled: WhereCompiled, addCommand: boolean = false) {
        super.compileWhere(compiled, addCommand);
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
