import { ExpressionOrColumn, Utils, ValueTypeToParse } from "./utils";
import { MapperTable } from "../mapper-table";
import { Column } from "./column";
import { FieldType } from "./enums/field-type";
import { ColumnsCompiled } from "./columns-compiled";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { DatabaseHelper } from "../database-helper";

export abstract class ColumnsBaseBuilder<
    TThis extends ColumnsBaseBuilder<TThis, T, TColumn>,
    T,
    TColumn extends Column
    > {

    protected columns: TColumn[] = [];

    private _databaseHelper: DatabaseHelper = new DatabaseHelper();

    constructor(
        protected readonly mapperTable: MapperTable,
        protected readonly modelToSave: T
    ) {
    }

    public allColumns() {
        // clear columns
        this.columns = [];
        this.setAllColumns(this.mapperTable, this.modelToSave);
    }

    public setColumn(
        column: string,
        type: FieldType,
        primaryKeyType: PrimaryKeyType
    ): TThis {
        this.columns.push({
            name: column,
            type,
            primaryKeyType
        } as TColumn);
        return this.getInstance();
    }

    public set<TReturn extends ValueTypeToParse>(
        columnExpression: ExpressionOrColumn<TReturn, T>,
        primaryKeyType: PrimaryKeyType,
        type?: new () => TReturn
    ): TThis {
        return this.setColumn(
            Utils.getColumn(columnExpression),
            type
                ? this._databaseHelper.getFieldType(type)
                : Utils.getType(this.modelToSave, columnExpression),
            primaryKeyType
        );
    }

    public compile(): ColumnsCompiled {
        const result: ColumnsCompiled = {
            columns: [],
            keyColumns: [],
            params: [],
        };
        for (const key in this.columns) {
            if (this.columns.hasOwnProperty(key)) {
                const column = this.columns[key];
                if (column.primaryKeyType) {
                    result.keyColumns.push(column.name);
                }
                const columnFormat = this.columnFormat(column);
                if (columnFormat) {
                    result.columns.push(columnFormat);
                }
            }
        }
        return result;
    }

    protected isCompositeKey(): boolean {
        return this.mapperTable && this.mapperTable.columns.filter(x => !!x.primaryKeyType).length > 1;
    }

    protected abstract columnFormat(column: TColumn): string;

    protected abstract getInstance(): TThis;

    protected abstract setColumnValue(
        column: string,
        value: ValueTypeToParse,
        fieldType: FieldType,
        primaryKeyType: PrimaryKeyType
    ): TThis;

    private setAllColumns(mapper: MapperTable, modelWithValue: T): void {
        for (const key in mapper.columns) {
            if (mapper.columns.hasOwnProperty(key)) {
                const column = mapper.columns[key];
                const value = Utils.getValue<any, any>(modelWithValue, column.fieldReference);
                this.setColumnValue(
                    column.column,
                    value,
                    column.fieldType,
                    column.primaryKeyType
                );
            }
        }
    }
}
