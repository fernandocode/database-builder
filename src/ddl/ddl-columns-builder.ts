import { Utils } from "../core/utils";
import { ValueTypeToParse } from "../core/utils";
import { ColumnsBaseBuilder } from "../core/columns-base-builder";
import { Column } from "../core/column";
import { FieldType } from "../core/enums/field-type";
import { DatabaseBuilderError } from "..";

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
                throw new DatabaseBuilderError(`Mapper '${this.metadata.newable.name}', auto increment not work to composite id`);
            }
            return `${column.name} ${Utils.parseColumnType(column.type)}`;
        }
        if (column.isAutoIncrement && !column.isKeyColumn) {
            throw new DatabaseBuilderError(`Mapper '${this.metadata.newable.name}', auto increment not work in column not primary key`);
        }
        if (column.type === FieldType.NULL) {
            throw new DatabaseBuilderError(`Mapper '${this.metadata.newable.name}', column '${column.name}' of type 'NULL' not supported!`);
        }
        return `${column.name} ${Utils.parseColumnType(column.type)}${column.isKeyColumn ? ` NOT NULL PRIMARY KEY` : ""}${column.isAutoIncrement ? ` AUTOINCREMENT` : ""}`;
    }
}
