import { Utils } from "../core/utils";
import { ValueTypeToParse } from "../core/utils";
import { ColumnsBaseBuilder } from "../core/columns-base-builder";
import { Column } from "../core/column";
import { FieldType } from "../core/enums/field-type";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { DatabaseBuilderError } from "../core/errors";
import { ColumnType } from "../core/enums/column-type";

export class DdlColumnsBuilder<T> extends ColumnsBaseBuilder<DdlColumnsBuilder<T>, T, Column> {

    protected setColumnValue(
        column: string,
        value: ValueTypeToParse,
        fieldType: FieldType,
        primaryKeyType: PrimaryKeyType
    ): DdlColumnsBuilder<T> {
        return this.setColumn(
            column,
            fieldType,
            primaryKeyType
        );
    }

    protected getInstance(): DdlColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        if (this.isCompositeKey()) {
            if (column.primaryKeyType === PrimaryKeyType.AutoIncrement) {
                throw new DatabaseBuilderError(`Mapper '${this.mapperTable.tableName}', auto increment not work to composite id`);
            }
            return `${column.name} ${Utils.parseColumnType(column.type)}`;
        }
        if (Utils.isFlag(column.type, FieldType.NULL)) {
            throw new DatabaseBuilderError(`Mapper '${this.mapperTable.tableName}', column '${column.name}' of type 'NULL' not supported!`);
        }
        // is table reference/list
        const columnType = Utils.parseColumnType(column.type);
        if (columnType === ColumnType.TABLE_REFERENCE) {
            return void 0;
        }
        return `${column.name} ${columnType}${!!column.primaryKeyType ? ` NOT NULL PRIMARY KEY` : ""}${column.primaryKeyType === PrimaryKeyType.AutoIncrement ? ` AUTOINCREMENT` : ""}`;
        // return `${column.name} ${Utils.parseColumnType(column.type)}${!!column.primaryKeyType ? ` NOT NULL PRIMARY KEY` : ""}${column.primaryKeyType === PrimaryKeyType.AutoIncrement ? ` AUTOINCREMENT` : ""}`;
    }
}
