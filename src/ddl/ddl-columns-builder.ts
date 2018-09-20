import { Utils } from "../core/utils";
import { ValueTypeToParse } from "../core/utils";
import { ColumnsBaseBuilder } from "../core/columns-base-builder";
import { Column } from "../core/column";
import { FieldType } from "../core/enums/field-type";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { DatabaseBuilderError } from "../core/errors";

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
                throw new DatabaseBuilderError(`Mapper '${this.metadata.newable.name}', auto increment not work to composite id`);
            }
            return `${column.name} ${Utils.parseColumnType(column.type)}`;
        }
        if (column.type === FieldType.NULL) {
            throw new DatabaseBuilderError(`Mapper '${this.metadata.newable.name}', column '${column.name}' of type 'NULL' not supported!`);
        }
        return `${column.name} ${Utils.parseColumnType(column.type)}${!!column.primaryKeyType ? ` NOT NULL PRIMARY KEY` : ""}${column.primaryKeyType === PrimaryKeyType.AutoIncrement ? ` AUTOINCREMENT` : ""}`;
    }
}
