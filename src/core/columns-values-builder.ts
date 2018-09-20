import { KeyUtils } from "./key-utils";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { MetadataTable } from "../metadata-table";
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

    public setColumnValue(
        column: string,
        value: ValueTypeToParse,
        fieldType: FieldType,
        primaryKeyType?: PrimaryKeyType
    ): TThis {
        // verificar se é GUID, se for gerar um valor para o mesmo
        if (primaryKeyType === PrimaryKeyType.Guid && !value) {
            // gerar GUID
            value = Utils.GUID();
            // set value GUID in model
            KeyUtils.setKey(this.metadata, this.modelToSave, value);
        }
        this.columns.push({
            name: column,
            type: fieldType,
            value: Utils.getValueType(value, fieldType),
            primaryKeyType
        });
        return this.getInstance();
    }

    public setValue<TReturn extends ValueTypeToParse>(
        expression: ExpressionOrColumn<TReturn, T>,
        value: TReturn,
        primaryKeyType?: PrimaryKeyType
    ): TThis {
        return this.setColumnValue(
            Utils.getColumn(expression),
            value,
            Utils.getType(value),
            primaryKeyType
        );
    }

    public set<TReturn extends ValueTypeToParse>(
        expression: ExpressionOrColumn<TReturn, T>,
        primaryKeyType?: PrimaryKeyType
    ): TThis {
        return this.setValue(
            expression,
            this.getValueByExpression(expression),
            primaryKeyType
        );
    }

    public compile(): ColumnsCompiled {
        const result: ColumnsCompiled = {
            columns: [],
            keyColumns: [],
            params: [],
        };
        result.keyColumns = this.columns.filter(x => !!x.primaryKeyType).map(x => x.name);
        // result.keyColumns = this.columns.filter(x => x.isKeyColumn).map(x => x.name);
        this.columns.forEach((column) => {
            const columnName = this.columnFormat(column);
            if (columnName !== void 0) {
                result.columns.push(columnName);
                result.params.push(column.value);
            }
        });
        return result;
    }

    protected abstract columnFormat(column: Column): string;

    private getValueByExpression<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return Utils.getValue(this.modelToSave, expression);
    }
}
