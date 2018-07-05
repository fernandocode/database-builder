import { MetadataTable } from "./../metadata-table";
import { ExpressionOrColumn, Utils, ValueTypeToParse } from "./utils";
import { ColumnsBaseBuilder } from "./columns-base-builder";
import { Column } from "./column";
import { FieldType } from "./enums/field-type";
import { ColumnsCompiled } from "./columns-compiled";

export abstract class ColumnsValuesBuilder<
    T, TThis extends ColumnsValuesBuilder<T, TThis>>
    extends ColumnsBaseBuilder<TThis, T, Column> {

    constructor(
        metadata: MetadataTable<T>,
        modelToSave: T = void 0,
    ) {
        super(metadata, modelToSave);
    }

    public setColumnValue(column: string, value: ValueTypeToParse, fieldType: FieldType): TThis {
        this.columns.push({
            name: column,
            type: fieldType,
            value: Utils.getValueType(value, fieldType),
        });
        return this.getInstance();
    }

    public setValue<TReturn extends ValueTypeToParse>(expression: ExpressionOrColumn<TReturn, T>, value: TReturn): TThis {
        return this.setColumnValue(
            Utils.getColumn(expression),
            value,
            Utils.getType(value),
        );
    }

    public set<TReturn extends ValueTypeToParse>(expression: ExpressionOrColumn<TReturn, T>): TThis {
        return this.setValue(
            expression,
            this.getValueByExpression(expression),
        );
    }

    public compile(): ColumnsCompiled {
        const result: ColumnsCompiled = {
            columns: [],
            params: [],
        };
        this.columns.forEach((column) => {
            result.columns.push(this.columnFormat(column));
            result.params.push(column.value);
        });
        return result;
    }

    protected abstract columnFormat(column: Column): string;

    private getValueByExpression<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return Utils.getValue(this.modelToSave, expression);
    }
}
