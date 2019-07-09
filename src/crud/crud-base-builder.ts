import { WhereBuilder } from "./where-builder";
import { ColumnsValuesBuilder } from "../core/columns-values-builder";
import { ColumnsCompiled } from "../core/columns-compiled";
import { MapperTable } from "../mapper-table";
import { SqlBaseBuilder } from "./sql-base-builder";
import { QueryCompiled } from "../core/query-compiled";

export abstract class CrudBaseBuilder<
    T,
    TColumnsBuilder extends ColumnsValuesBuilder<T, TColumnsBuilder>
    > extends SqlBaseBuilder<T> {

    private _columnsCompiled: ColumnsCompiled = {
        columns: [],
        params: [],
        keyColumns: []
    };

    constructor(
        typeT: new () => T,
        mapperTable: MapperTable,
        alias: string = void 0,
    ) {
        super(typeT, typeT, mapperTable, alias);
    }

    public compile(): QueryCompiled {
        const compiledBase = this.buildBase();
        return {
            params: compiledBase.params.concat(this.whereCompiled.params),
            query: `${compiledBase.query}${this.whereCompiled.where}`,
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
        const instanceWhere: WhereBuilder<T> = new WhereBuilder(this._newable, withAlias ? this._alias : void 0);
        whereCallback(instanceWhere);
        this.compileWhere(this.whereCompiled, instanceWhere.compile());
        return instanceReturn;
    }

    protected abstract setDefaultColumns(): void;

    public abstract getModel(): T;

    private compileColumns(compiled: ColumnsCompiled) {
        if (compiled.columns.length) {
            this._columnsCompiled.columns = this._columnsCompiled.columns.concat(compiled.columns);
            this._columnsCompiled.params = this._columnsCompiled.params.concat(compiled.params);
        }
    }
}
