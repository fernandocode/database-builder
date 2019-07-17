import { DdlColumnsBuilder } from "../ddl-columns-builder";
import { DdlBaseBuilder } from "../ddl-base-builder";
import { MapperTable } from "../../mapper-table";
import { DdlCompiled } from "../../core/ddl-compided";
import { ExpressionOrColumn, Utils, ValueTypeToParse } from "../../core/utils";
import { DatabaseBuilderError } from "../../core";

export class AlterBuilder<T> extends DdlBaseBuilder<T> {

    private _patternOperation: (column: string) => string;

    constructor(
        private typeT: new () => T
    ) {
        super(typeT.name);
    }

    public addColumn<TReturn extends ValueTypeToParse>(
        columnExpression: ExpressionOrColumn<TReturn, T>,
        type?: new () => TReturn
    ): AlterBuilder<T> {
        this._patternOperation = (column: string) => `ADD COLUMN ${column}`;
        return super.columnsBase(
            column => column.set(columnExpression, void 0, type),
            new DdlColumnsBuilder<T>(
                void 0,
                new this.typeT()
            ),
            this);
    }

    public renameColumn<TReturn extends ValueTypeToParse>(
        columnExpression: ExpressionOrColumn<TReturn, T>,
        newColumnNameExpression: ExpressionOrColumn<TReturn, T>
    ): AlterBuilder<T> {
        this._patternOperation = (column: string) => `RENAME COLUMN ${column} TO ${Utils.getColumn(newColumnNameExpression)}`;
        return super.columnsBase(
            column => column.set(columnExpression, void 0),
            new DdlColumnsBuilder<T>(
                void 0,
                void 0
            ),
            this);
    }

    public renameTable<TNewTable>(
        newTableName: string | (new () => TNewTable)
    ): AlterBuilder<T> {
        this._patternOperation = () => `RENAME TO ${(Utils.isString(newTableName) ? newTableName as string : (newTableName as new () => void).name)}`;
        return this;
    }

    protected resolveDependency(dependency: MapperTable): DdlCompiled {
        return void 0;
    }

    protected dependencies(): MapperTable[] {
        return [];
    }

    protected buildBase(): string {
        const column = this.getColumnsCompiled();
        if (column.columns.length > 1) {
            throw new DatabaseBuilderError(`Not allowed ALTER TABLE in multi columns (number columns: ${column.columns.length})!`);
        }
        if (column.columns.length === 0 && Utils.isNull(this._patternOperation)) {
            throw new DatabaseBuilderError(`Not column for ALTER TABLE, use 'addColumn'!`);
        }
        return `ALTER TABLE ${this._tablename}
            ${this._patternOperation(column.columns[0])};`;
    }

    protected setDefaultColumns(): void {
    }
}
