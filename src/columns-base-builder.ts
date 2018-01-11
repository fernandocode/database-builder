import { MetadataTable } from './metadata-table';
import { DatabaseHelper } from "./database-helper";
import { ValueTypeToParse, Column, FieldType, ColumnsCompiled } from "./utils";
import { Expression, ExpressionUtils } from "lambda-expression";
import { MapperTable } from './mapper-table';

export abstract class ColumnsBaseBuilder<TThis extends ColumnsBaseBuilder<TThis, T, TColumn>, T, TColumn extends Column>{

    protected columns: TColumn[] = [];
    protected readonly expressionUtils: ExpressionUtils;
    protected readonly databaseHelper: DatabaseHelper;

    constructor(
        protected readonly metadata: MetadataTable<T>,
        protected readonly modelToSave: T = metadata.instance
    ) {
        this.expressionUtils = new ExpressionUtils();
        this.databaseHelper = new DatabaseHelper();
    }

    public allColumns() {
        // clear columns
        this.columns = [];
        this.setAllColumns(this.metadata.mapperTable, this.modelToSave);
    }

    public setColumn(column: string, type: FieldType): TThis {
        this.columns.push(<TColumn>{
            name: column,
            type: type
        });
        return this.getInstance();
    }

    public set(expression: Expression<T>): TThis {
        return this.setColumn(
            this.expressionUtils.getColumnByExpression(expression),
            this.getTypeByExpression(expression)
        );
    }

    public compile(): ColumnsCompiled {
        let result: ColumnsCompiled = {
            columns: [],
            params: []
        };
        this.columns.forEach(column => {
            result.columns.push(this.columnFormat(column));
        });
        return result;
    }

    private setAllColumns(mapper: MapperTable, modelWithValue: T): void {
        for (let key in mapper.columns) {
            let column = mapper.columns[key];
            this.setColumnValue(column.column, this.databaseHelper.getValue(modelWithValue, column.fieldReference), column.fieldType);
        }
    }

    protected getTypeByValue(value: ValueTypeToParse): FieldType {
        return this.databaseHelper.getType(value);
    }

    protected getTypeByExpression(expression: Expression<T>): FieldType {
        return this.getTypeByValue(this.expressionUtils.getValueByExpression(this.metadata.instance, expression));
    }

    protected abstract columnFormat(column: TColumn): string;

    protected abstract getInstance(): TThis;

    protected abstract setColumnValue(column: string, value: ValueTypeToParse, fieldType: FieldType): TThis;
}

export class DdlColumnsBuilder<T> extends ColumnsBaseBuilder<DdlColumnsBuilder<T>, T, Column>{

    protected setColumnValue(column: string, value: ValueTypeToParse, fieldType: FieldType): DdlColumnsBuilder<T> {
        return this.setColumn(column, fieldType);
    }

    protected getInstance(): DdlColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return `${column.name} ${this.databaseHelper.parseToColumnType(column.type)}`;
    }
}