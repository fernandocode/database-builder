import { DatabaseBuilderError } from "./errors";
import { KeyUtils } from "./key-utils";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { ExpressionOrColumn, Utils, ValueType, ValueTypeToParse } from "./utils";
import { ColumnsBaseBuilder } from "./columns-base-builder";
import { Column } from "./column";
import { FieldType } from "./enums/field-type";
import { ColumnsCompiled } from "./columns-compiled";
import { MapperTable } from "../mapper-table";
import { ColumnType } from "./enums/column-type";

export abstract class ColumnsValuesBuilder<
    T, TThis extends ColumnsValuesBuilder<T, TThis>>
    extends ColumnsBaseBuilder<TThis, T, Column> {

    constructor(
        mapperTable: MapperTable,
        modelToSave: T | Array<T>,
    ) {
        super(mapperTable, modelToSave);
    }

    protected setColumnValue(
        column: string,
        values: Array<ValueTypeToParse>,
        fieldType: FieldType,
        primaryKeyType?: PrimaryKeyType
    ): TThis {
        values = values.map((value, index) => {
            switch (primaryKeyType) {
                case PrimaryKeyType.Assigned:
                    if (Utils.isNull(value)) {
                        throw new DatabaseBuilderError("Primary key to be informed when generation strategy is 'Assigned'!");
                    }
                    return value;
                case PrimaryKeyType.Guid:
                    if ((Utils.isNull(value) || (value as string).length === 0) && this.allowGenerateKey()) {
                        // gerar GUID
                        value = Utils.GUID();
                        // set value GUID in model
                        KeyUtils.setKey(this.mapperTable,
                            Utils.isArray(this.modelToSave)
                                ? (this.modelToSave as Array<T>)[index]
                                : this.modelToSave,
                            value);
                    }
                    return value;
                case PrimaryKeyType.AutoIncrement:
                default:
                    return value;
            }
        });
        this.columns.push({
            name: column,
            type: fieldType,
            value: Utils.getValueType(values, fieldType),
            primaryKeyType
        });
        return this.getInstance();
    }

    public setValue<TReturn extends ValueTypeToParse>(
        expression: ExpressionOrColumn<TReturn, T>,
        value: TReturn | Array<TReturn>,
        primaryKeyType?: PrimaryKeyType
    ): TThis {
        return this.setColumnValue(
            Utils.getColumn(expression),
            Utils.isArray(value) ? value as Array<TReturn> : [value],
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
        this.columns.forEach((column) => {
            if (this.isAddColumn(column)) {
                const columnName = this.columnFormat(column);
                if (!Utils.isNull(columnName)) {
                    result.columns.push(columnName);
                    let values = (Utils.isArray(column.value) ? column.value : [column.value]) as Array<ValueType>;
                    for (let index = 0; index < values.length; index++) {
                        const item = values[index];
                        if (!result.params[index])
                            result.params[index] = [];
                        result.params[index].push(this.resolveNullValueType(item));
                    }
                }
            }
        });
        return result;
    }

    private resolveNullValueType(value: ValueType): ValueType {
        return Utils.isNull(value) ? null : value;
    }

    protected allowGenerateKey(): boolean {
        return false;
    }

    protected isAddColumn(column: Column): boolean {
        // is table reference/list
        const columnType = Utils.parseColumnType(column.type);
        if (columnType === ColumnType.TABLE_REFERENCE) {
            return false;
        }
        return true;
    }

    protected columnFormat(column: Column): string {
        return column.name;
    }

    protected getValueByExpression<TReturn>(expression: ExpressionOrColumn<TReturn, T>): Array<TReturn> {
        return Utils.getValue(this.modelToSave, expression);
    }
}
