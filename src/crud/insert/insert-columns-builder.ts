import { ColumnsValuesBuilder } from "../../core/columns-values-builder";
import { Column } from "../../core/column";
import { PrimaryKeyType } from "../../core/enums/primary-key-type";

export class InsertColumnsBuilder<T> extends ColumnsValuesBuilder<T, InsertColumnsBuilder<T>> {

    protected getInstance(): InsertColumnsBuilder<T> {
        return this;
    }

    protected isAddColumn(column: Column): boolean {
        return super.isAddColumn(column) && !(column.primaryKeyType === PrimaryKeyType.AutoIncrement);
    }

    protected allowGenerateKey(): boolean {
        return true;
    }
}
