import { DdlColumnsBuilder } from "./ddl-columns-builder";
import { ColumnsBaseCompiled } from "../core/columns-base-compiled";
import { DdlCompiled } from "../core/ddl-compided";
import { MapperTable } from "../mapper-table";

export abstract class DdlBaseBuilder<T> {

    private _columnsCompiled: ColumnsBaseCompiled = {
        columns: [],
        keyColumns: []
    } as ColumnsBaseCompiled;

    constructor(
        protected _tablename: string
    ) {
    }

    public build(): DdlCompiled {
        const dependenciesCompiled: DdlCompiled[] = [];
        this.dependencies().forEach(dependency => {
            dependenciesCompiled.push(this.resolveDependency(dependency));
        });
        return {
            script: this.removeMultiSpacesAndBreakLines(this.buildBase()),
            dependencies: dependenciesCompiled
        } as DdlCompiled;
    }

    protected removeMultiSpacesAndBreakLines(str: string) {
        return str.replace(/\s\s+/g, " ");
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

    protected abstract resolveDependency(dependency: MapperTable): DdlCompiled;

    protected abstract dependencies(): MapperTable[];

    protected abstract buildBase(): string;

    protected abstract setDefaultColumns(): void;

    private compileColumns(compiled: ColumnsBaseCompiled) {
        if (compiled.columns.length) {
            this._columnsCompiled.columns = this._columnsCompiled.columns.concat(compiled.columns);
            this._columnsCompiled.keyColumns = this._columnsCompiled.keyColumns.concat(compiled.keyColumns);
        }
    }
}
