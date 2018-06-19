import { DdlColumnsBuilder } from "./ddl-columns-builder";
import { ColumnsBaseCompiled } from "./../core/columns-base-compiled";

export abstract class DdlBaseBuilder<T> {

    private _columnsCompiled: ColumnsBaseCompiled = {
        columns: [],
    } as ColumnsBaseCompiled;

    constructor(
        protected _tablename: string
    ) {
    }

    public compile(): string {
        return this.buildBase();
    }

    protected getColumnsCompiled(): ColumnsBaseCompiled {
        if (!this._columnsCompiled.columns.length) {
            this.setDefaultColumns();
        }
        return this._columnsCompiled;
    }

    protected columnsBase<TBuilder extends DdlBaseBuilder<T>>(
        columnsCallback: (columns: DdlColumnsBuilder<T>) => void,
        instanceSetColumnsBuilder: DdlColumnsBuilder<T>,
        instanceReturn: TBuilder)
        : TBuilder {
        columnsCallback(instanceSetColumnsBuilder);
        this.compileColumns(instanceSetColumnsBuilder.compile());
        return instanceReturn;
    }

    protected abstract buildBase(): string;

    protected abstract setDefaultColumns(): void;

    private compileColumns(compiled: ColumnsBaseCompiled) {
        if (compiled.columns.length) {
            this._columnsCompiled.columns = this._columnsCompiled.columns.concat(compiled.columns);
        }
    }
}
