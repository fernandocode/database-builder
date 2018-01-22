import { Utils } from "./../core/utils";
import { ValueTypeToParse } from "../core/utils";
import { ColumnsBaseBuilder } from "../core/columns-base-builder";
import { Column } from "../core/column";
import { FieldType } from "../core/enums/field-type";

export class DdlColumnsBuilder<T> extends ColumnsBaseBuilder<DdlColumnsBuilder<T>, T, Column> {

    protected setColumnValue(column: string, value: ValueTypeToParse, fieldType: FieldType): DdlColumnsBuilder<T> {
        return this.setColumn(column, fieldType);
    }

    protected getInstance(): DdlColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return `${column.name} ${Utils.parseColumnType(column.type)}`;
    }
}
