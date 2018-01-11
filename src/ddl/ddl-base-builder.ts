import { DdlColumnsBuilder } from './ddl-columns-builder';
import { ColumnsBaseCompiled } from './../core/utils';

export abstract class DdlBaseBuilder<T>{

    protected _tablename: string;

    private _columnsCompiled: ColumnsBaseCompiled = <ColumnsBaseCompiled>{
        columns: []
    };

    constructor(
        protected readonly _typeT: new () => T
    ) {
        this._tablename = _typeT.name;
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

    private compileColumns(compiled: ColumnsBaseCompiled) {
        if (compiled.columns.length) {
            this._columnsCompiled.columns = this._columnsCompiled.columns.concat(compiled.columns);
        }
    }

    public compile(): string {
        return this.buildBase();
    }

    protected abstract buildBase(): string;

    protected abstract setDefaultColumns(): void;
}