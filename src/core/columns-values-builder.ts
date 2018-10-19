import { DatabaseBuilderError } from "./errors";
import { KeyUtils } from "./key-utils";
import { PrimaryKeyType } from "./enums/primary-key-type";
import { ExpressionOrColumn, Utils, ValueTypeToParse } from "./utils";
import { ColumnsBaseBuilder } from "./columns-base-builder";
import { Column } from "./column";
import { FieldType } from "./enums/field-type";
import { ColumnsCompiled } from "./columns-compiled";
import { MapperTable } from "../mapper-table";
import { ColumnType } from "./enums/column-type";

export abstract class ColumnsValuesBuilder<
    T, TThis extends ColumnsValuesBuilder<T, TThis>>
    extends ColumnsBaseBuilder<TThis, T, Column> {

    // TODO: fixed list task
    constructor(
        // metadata: MetadataTable<T>,
        mapperTable: MapperTable,
        modelToSave: T,
        // modelToSave: T = metadata.instance,
        // modelToSave: T = void 0,
    ) {
        super(mapperTable, modelToSave);
        // super(metadata, modelToSave);
    }

    public setColumnValue(
        column: string,
        value: ValueTypeToParse,
        fieldType: FieldType,
        primaryKeyType?: PrimaryKeyType
    ): TThis {
        switch (primaryKeyType) {
            case PrimaryKeyType.Assigned:
                if (value === void 0) {
                    throw new DatabaseBuilderError("Primary key to be informed when generation strategy is 'Assigned'!");
                }
                break;
            case PrimaryKeyType.Guid:
                if (value === void 0 && this.allowGenerateKey()) {
                    // gerar GUID
                    value = Utils.GUID();
                    // set value GUID in model
                    KeyUtils.setKey(this.mapperTable, this.modelToSave, value);
                    // KeyUtils.setKey(this.metadata, this.modelToSave, value);
                }
                break;
            case PrimaryKeyType.AutoIncrement:
            default:
                break;
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
        this.columns.forEach((column) => {
            if (this.isAddColumn(column)) {
                const columnName = this.columnFormat(column);
                if (columnName !== void 0) {
                    result.columns.push(columnName);
                    result.params.push(column.value);
                }
            }
        });
        return result;
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

    private getValueByExpression<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return Utils.getValue(this.modelToSave, expression);
    }
}
