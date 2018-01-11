import { Column, ValueTypeToParse, FieldType } from "../core/utils";
import { ColumnsBaseBuilder } from "../core/columns-base-builder";

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