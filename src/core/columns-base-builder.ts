import { MetadataTable } from "../metadata-table";
import { ExpressionOrColumn, Utils, ValueTypeToParse } from "./utils";
import { MapperTable } from "../mapper-table";
import { Column } from "./column";
import { FieldType } from "./enums/field-type";
import { ColumnsCompiled } from "./columns-compiled";

export abstract class ColumnsBaseBuilder<
    TThis extends ColumnsBaseBuilder<TThis, T, TColumn>,
    T,
    TColumn extends Column
    > {

    protected columns: TColumn[] = [];

    constructor(
        protected readonly metadata: MetadataTable<T>,
        protected readonly modelToSave: T = metadata.instance,
    ) {
    }

    public allColumns() {
        // clear columns
        this.columns = [];
        this.setAllColumns(this.metadata.mapperTable, this.modelToSave);
    }

    public setColumn(
        column: string,
        type: FieldType,
        isKeyColumn: boolean,
        isAutoIncrement: boolean
    ): TThis {
        this.columns.push({
            name: column,
            type,
            isKeyColumn,
            isAutoIncrement
        } as TColumn);
        return this.getInstance();
    }

    public set<TReturn extends ValueTypeToParse>(
        expression: ExpressionOrColumn<TReturn, T>,
        isKeyColumn: boolean,
        isAutoIncrement: boolean
    ): TThis {
        return this.setColumn(
            Utils.getColumn(expression),
            Utils.getType(this.metadata.instance, expression),
            isKeyColumn,
            isAutoIncrement
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
                if (column.isKeyColumn) {
                    result.keyColumns.push(column.name);
                }
                result.columns.push(this.columnFormat(column));
            }
        }
        return result;
    }

    protected isCompositeKey(): boolean {
        return this.metadata.mapperTable.columns.filter(x => x.isKeyColumn === true).length > 1;
    }

    protected abstract columnFormat(column: TColumn): string;

    protected abstract getInstance(): TThis;

    protected abstract setColumnValue(
        column: string,
        value: ValueTypeToParse,
        fieldType: FieldType,
        isKeyColumn: boolean,
        isAutoIncrement: boolean
    ): TThis;

    private setAllColumns(mapper: MapperTable, modelWithValue: T): void {
        for (const key in mapper.columns) {
            if (mapper.columns.hasOwnProperty(key)) {
                const column = mapper.columns[key];
                this.setColumnValue(
                    column.column,
                    Utils.getValue(modelWithValue, column.fieldReference),
                    column.fieldType,
                    column.isKeyColumn,
                    column.isAutoIncrement
                );
            }
        }
    }
}
