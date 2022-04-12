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

    protected _columns: TColumn[] = [];

    private _databaseHelper: DatabaseHelper = new DatabaseHelper();

    constructor(
        protected readonly mapperTable: MapperTable,
        protected readonly toSave: T | Array<T>
    ) {
    }

    public get columns() { return this._columns };

    public allColumns() {
        // clear columns
        this._columns = [];
        this.setAllColumns(this.mapperTable, this.toSave);
    }

    public setColumn(
        column: string,
        type: FieldType,
        primaryKeyType: PrimaryKeyType
    ): TThis {
        this._columns.push({
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
            this.getFieldType(columnExpression, type),
            primaryKeyType
        );
    }

    public compile(): ColumnsCompiled {
        const result: ColumnsCompiled = {
            columns: [],
            keyColumns: [],
            params: [],
        };
        for (const key in this._columns) {
            if (this._columns.hasOwnProperty(key)) {
                const column = this._columns[key];
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
        value: ValueTypeToParse[],
        fieldType: FieldType,
        primaryKeyType: PrimaryKeyType
    ): TThis;

    private setAllColumns(mapper: MapperTable, modelWithValue: T | Array<T>): void {
        for (const key in mapper.columns) {
            if (mapper.columns.hasOwnProperty(key)) {
                const column = mapper.columns[key];
                this.setColumnValue(
                    column.column,
                    Utils.getValue<ValueTypeToParse, T>(modelWithValue, column.fieldReference),
                    column.fieldType,
                    column.primaryKeyType
                );
            }
        }
    }

    private getFieldType<TReturn extends ValueTypeToParse>(
        columnExpression: ExpressionOrColumn<TReturn, T>, type: new () => TReturn
    ): FieldType {
        if (type) {
            return this._databaseHelper.getFieldType(type);
        }
        const fieldTypeByMapper = this.mapperTable
            ? this.mapperTable.getColumnByField(columnExpression)
            : void 0;
        return fieldTypeByMapper
            ? fieldTypeByMapper.fieldType
            : Utils.getType(this.toSave, columnExpression);
    }
}
