import { MetadataTable } from './metadata-table';
import { ColumnsCompiled, ValueTypeToParse, Column, FieldType } from "./utils";
import { Expression } from "lambda-expression";
import { ColumnsBaseBuilder } from "./columns-base-builder";

export abstract class ColumnsValuesBuilder<T, TThis extends ColumnsValuesBuilder<T, TThis>> extends ColumnsBaseBuilder<TThis, T, Column>{

    constructor(
        metadata: MetadataTable<T>,
        modelToSave: T = void 0
    ) {
        super(metadata, modelToSave);
    } 

    public setColumnValue(column: string, value: ValueTypeToParse, fieldType: FieldType): TThis {
        this.columns.push({
            name: column,
            value: this.databaseHelper.parseToValueType(value, fieldType),
            type: fieldType
        });
        return this.getInstance();
    }

    public setValue(expression: Expression<T>, value: ValueTypeToParse): TThis {
        return this.setColumnValue(
            this.expressionUtils.getColumnByExpression(expression),
            value,
            this.databaseHelper.getType(value)
        );
    }

    public set(expression: Expression<T>): TThis {
        return this.setValue(
            expression,
            this.getValueByExpression(expression)
        );
    }

    public compile(): ColumnsCompiled {
        let result: ColumnsCompiled = {
            columns: [],
            params: []
        };
        this.columns.forEach(column => {
            result.columns.push(this.columnFormat(column));
            result.params.push(column.value);
        });
        return result;
    }

    protected abstract columnFormat(column: Column): string;

    private getValueByExpression(expression: Expression<T>) {
        return this.expressionUtils.getValueByExpression(this.modelToSave, expression);
    }
}