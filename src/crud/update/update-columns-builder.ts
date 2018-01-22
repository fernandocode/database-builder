import { ColumnsValuesBuilder } from "../../core/columns-values-builder";
import { Column } from "../../core/column";

export class UpdateColumnsBuilder<T> extends ColumnsValuesBuilder<T, UpdateColumnsBuilder<T>> {

    protected getInstance(): UpdateColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return `${column.name} = ?`;
    }
}
