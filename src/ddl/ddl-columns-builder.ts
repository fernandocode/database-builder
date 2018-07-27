import { Utils } from "../core/utils";
import { ValueTypeToParse } from "../core/utils";
import { ColumnsBaseBuilder } from "../core/columns-base-builder";
import { Column } from "../core/column";
import { FieldType } from "../core/enums/field-type";

export class DdlColumnsBuilder<T> extends ColumnsBaseBuilder<DdlColumnsBuilder<T>, T, Column> {

    protected setColumnValue(
        column: string,
        value: ValueTypeToParse,
        fieldType: FieldType,
        isPrimaryKey: boolean,
        isAutoIncrement: boolean
    ): DdlColumnsBuilder<T> {
        return this.setColumn(
            column,
            fieldType,
            isPrimaryKey,
            isAutoIncrement
        );
    }

    protected getInstance(): DdlColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        if (this.isCompositeKey()) {
            if (column.isAutoIncrement) {
                throw new Error("Auto increment not work to composite id");
            }
            return `${column.name} ${Utils.parseColumnType(column.type)}`;
        }
        if (column.isAutoIncrement && !column.isKeyColumn) {
            throw new Error("Auto increment not work in column not primary key");
        }
        return `${column.name} ${Utils.parseColumnType(column.type)}${column.isKeyColumn ? ` NOT NULL PRIMARY KEY` : ""}${column.isAutoIncrement ? ` AUTOINCREMENT` : ""}`;
        // return `${column.name} ${Utils.parseColumnType(column.type)}${column.isAutoIncrement ? ` AUTOINCREMENT` : ""}`;
    }
}
