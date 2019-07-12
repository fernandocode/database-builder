import { QueryCompiled } from "../core/query-compiled";
import { WhereCompiled } from "./where-compiled";
import { MapperTable } from "../mapper-table";
import { QueryCompilable } from "../core/query-compilable";
import { QueryBuilder } from "./query/query-builder";
import { Utils } from "../core/utils";

export abstract class SqlBaseBuilder<T> implements QueryCompilable {

    protected _tablename: string;

    protected whereCompiled: WhereCompiled = { where: "", params: [] };

    protected innerUsedAliasTest: Array<{ hasAlias: (alias: string) => boolean }> = [];

    private readonly WHERE = " WHERE ";
    private NEXT_VALUE_ALIAS: number = 0;

    constructor(
        queryT: (new () => T) | QueryBuilder<T>,
        protected _newable: new () => T,
        public mapperTable: MapperTable,
        protected readonly _alias: string = void 0,
    ) {
        if (Utils.isQueryBuilder(queryT)) {
            this.innerUsedAliasTest.push((queryT as QueryBuilder<T>))
        }
        this._tablename = this.createTablename(_newable, mapperTable);
        this._alias = this.createAlias(this._alias, this._tablename);
    }

    protected createTablename<TTable>(currentTypeT: new () => TTable, currentMapper: MapperTable): string {
        return currentTypeT ? currentTypeT.name : currentMapper.tableName;
    }

    protected createAlias(currentAlias: string, currentTablename: string): string {
        return currentAlias
            ? currentAlias
            : this.createUniqueAlias(this.defaultAlias(currentTablename));
    }

    public getMapper(): MapperTable {
        return this.mapperTable;
    }

    public hasAlias(alias: string): boolean {
        if (this._alias === alias) {
            return true;
        }
        return !!this.innerUsedAliasTest.find(x => x.hasAlias(alias));
    }

    public abstract compile(): QueryCompiled;

    protected abstract buildBase(): QueryCompiled;

    protected compileWhere(current: WhereCompiled, compiled: WhereCompiled, addCommand: boolean = true) {
        if (compiled.where.length) {
            current.where +=
                `${(current.where.length ? " AND " : (addCommand ? this.WHERE : ""))}${compiled.where}`;
            current.params =
                current.params.concat(compiled.params);
        }
    }

    private defaultAlias(tableName: string) {
        if (tableName.length > 3) {
            return tableName.substring(0, 3);
        }
        return tableName;
    }

    private createUniqueAlias(aliasProposed: string): string {
        aliasProposed = aliasProposed ? aliasProposed.toLowerCase() : aliasProposed;
        if (this.hasAlias(aliasProposed)) {
            return this.createUniqueAlias(`${aliasProposed}${this.NEXT_VALUE_ALIAS++}`);
        }
        return aliasProposed;
    }
}
