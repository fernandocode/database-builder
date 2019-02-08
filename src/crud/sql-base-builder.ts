import { QueryCompiled } from "../core/query-compiled";
import { WhereCompiled } from "./where-compiled";
import { MapperTable } from "../mapper-table";
import { QueryCompilable } from "../core/query-compilable";

// let NEXT_VALUE_ALIAS: number = 0;

export abstract class SqlBaseBuilder<T> implements QueryCompilable {
    
    private NEXT_VALUE_ALIAS: number = 0;

    protected _tablename: string;

    protected whereCompiled: WhereCompiled = { where: "", params: [] };

    private readonly WHERE = " WHERE ";

    protected innerUsedAliasTest: { hasAlias: (alias: string) => boolean }[] = [];

    constructor(
        protected readonly _typeT: new () => T,
        public mapperTable: MapperTable,
        protected readonly _alias: string = void 0,
    ) {
        this._tablename = this.createTablename(_typeT, mapperTable);
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
        // return false;
    }

    public abstract compile(): QueryCompiled;

    protected abstract buildBase(): QueryCompiled;

    protected compileWhere(compiled: WhereCompiled, addCommand: boolean = true) {
        if (compiled.where.length) {
            this.whereCompiled.where +=
                `${(this.whereCompiled.where.length ? " AND " : (addCommand ? this.WHERE : ""))}${compiled.where}`;
            this.whereCompiled.params =
                this.whereCompiled.params.concat(compiled.params);
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
