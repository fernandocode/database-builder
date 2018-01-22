import { WhereBuilder } from "./where-builder";
import { ColumnsValuesBuilder } from "./../core/columns-values-builder";
import { ColumnsCompiled } from "../core/columns-compiled";
import { QueryCompiled } from "../core/query-compiled";
import { CrudCompiled } from "../core/crud-compiled";
import { WhereCompiled } from "./where-compiled";

let NEXT_VALUE_ALIAS: number = 0;

export abstract class CrudBaseBuilder<T, TColumnsBuilder extends ColumnsValuesBuilder<T, TColumnsBuilder>> {

    protected _tablename: string;

    private _columnsCompiled: ColumnsCompiled = { columns: [], params: [] };
    private _whereCompiled: WhereCompiled = { where: "", params: [] };

    constructor(
        protected readonly _typeT: new () => T,
        protected readonly _alias: string = void 0,
        protected readonly _modelToSave: T = void 0,
    ) {
        this._tablename = _typeT.name;
        if (!this._alias) {
            this._alias = this.createUniqueAlias(this.defaultAlias(_typeT));
        }
    }

    public hasAlias(alias: string): boolean {
        if (this._alias === alias) {
            return true;
        }
        return false;
    }

    public compile(): QueryCompiled {
        const compiledBase = this.buildBase();
        return {
            params: compiledBase.params.concat(this._whereCompiled.params),
            query: `${compiledBase.sql}${this._whereCompiled.where}`,
        };
    }

    protected getColumnsCompiled(): ColumnsCompiled {
        if (!this._columnsCompiled.columns.length) {
            this.setDefaultColumns();
        }
        return this._columnsCompiled;
    }

    protected columnsBase<TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>>(
        columnsCallback: (columns: TColumnsBuilder) => void,
        instanceSetColumnsBuilder: TColumnsBuilder,
        instanceReturn: TBuilder)
        : TBuilder {
        columnsCallback(instanceSetColumnsBuilder);
        this.compileColumns(instanceSetColumnsBuilder.compile());
        return instanceReturn;
    }

    protected whereBase<TBuilder extends CrudBaseBuilder<T, TColumnsBuilder>>(
        whereCallback: (where: WhereBuilder<T>) => void,
        instanceReturn: TBuilder, withAlias: boolean = true)
        : TBuilder {
        const instanceWhere: WhereBuilder<T> = new WhereBuilder(this._typeT, withAlias ? this._alias : void 0);
        whereCallback(instanceWhere);
        this.compileWhere(instanceWhere.compile());
        return instanceReturn;
    }

    protected abstract buildBase(): CrudCompiled;

    protected abstract setDefaultColumns(): void;

    private compileWhere(compiled: WhereCompiled) {
        if (compiled.where.length) {
            this._whereCompiled.where += `${(this._whereCompiled.where.length ? " AND " : " WHERE ")}${compiled.where}`;
            this._whereCompiled.params = this._whereCompiled.params.concat(compiled.params);
        }
    }

    private defaultAlias(typeT: new () => T) {
        if (typeT.name.length > 3) {
            return typeT.name.substring(0, 3);
        }
        return typeT.name;
    }

    private createUniqueAlias(aliasProposed: string): string {
        if (this.hasAlias(aliasProposed)) {
            return this.createUniqueAlias(`${aliasProposed}${NEXT_VALUE_ALIAS++}`);
        }
        return aliasProposed;
    }

    private compileColumns(compiled: ColumnsCompiled) {
        if (compiled.columns.length) {
            this._columnsCompiled.columns = this._columnsCompiled.columns.concat(compiled.columns);
            this._columnsCompiled.params = this._columnsCompiled.params.concat(compiled.params);
        }
    }
}
