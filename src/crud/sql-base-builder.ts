import { QueryCompiled } from "../core/query-compiled";
import { WhereCompiled } from "./where-compiled";
import { MapperTable } from "../mapper-table";
import { QueryCompilable } from "../core/query-compilable";

let NEXT_VALUE_ALIAS: number = 0;

export abstract class SqlBaseBuilder<T> implements QueryCompilable {

    protected _tablename: string;

    // private _columnsCompiled: ColumnsCompiled = { columns: [], params: [], keyColumns: [] };
    protected whereCompiled: WhereCompiled = { where: "", params: [] };

    private readonly WHERE = " WHERE ";

    constructor(
        protected readonly _typeT: new () => T,
        protected mapperTable: MapperTable,
        protected readonly _alias: string = void 0,
    ) {
        this._tablename = _typeT ? _typeT.name : mapperTable.tableName;
        if (!this._alias) {
            this._alias = this.createUniqueAlias(this.defaultAlias(this._tablename));
        }
    }

    public getMapper(): MapperTable {
        return this.mapperTable;
    }

    public hasAlias(alias: string): boolean {
        if (this._alias === alias) {
            return true;
        }
        return false;
    }

    public abstract compile(): QueryCompiled;

    // protected getColumnsCompiled(): ColumnsCompiled {
    //     if (!this._columnsCompiled.columns.length) {
    //         this.setDefaultColumns();
    //     }
    //     return this._columnsCompiled;
    // }

    // protected columnsBase<TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>>(
    //     columnsCallback: (columns: TColumnsBuilder) => void,
    //     instanceSetColumnsBuilder: TColumnsBuilder,
    //     instanceReturn: TBuilder)
    //     : TBuilder {
    //     columnsCallback(instanceSetColumnsBuilder);
    //     this.compileColumns(instanceSetColumnsBuilder.compile());
    //     return instanceReturn;
    // }

    // protected whereBase<TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>>(
    //     whereCallback: (where: WhereBuilder<T>) => void,
    //     instanceReturn: TBuilder, withAlias: boolean = true)
    //     : TBuilder {
    //     const instanceWhere: WhereBuilder<T> = new WhereBuilder(this._typeT, withAlias ? this._alias : void 0);
    //     whereCallback(instanceWhere);
    //     this.compileWhere(instanceWhere.compile());
    //     return instanceReturn;
    // }

    protected abstract buildBase(): QueryCompiled;

    // protected abstract setDefaultColumns(): void;

    // public abstract getModel(): T;

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
            return this.createUniqueAlias(`${aliasProposed}${NEXT_VALUE_ALIAS++}`);
        }
        return aliasProposed;
    }

    // private compileColumns(compiled: ColumnsCompiled) {
    //     if (compiled.columns.length) {
    //         this._columnsCompiled.columns = this._columnsCompiled.columns.concat(compiled.columns);
    //         this._columnsCompiled.params = this._columnsCompiled.params.concat(compiled.params);
    //     }
    // }
}
