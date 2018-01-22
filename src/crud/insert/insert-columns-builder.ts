import { ColumnsValuesBuilder } from "../../core/columns-values-builder";
import { Column } from "../../core/column";

export class InsertColumnsBuilder<T> extends ColumnsValuesBuilder<T, InsertColumnsBuilder<T>> {

    protected getInstance(): InsertColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return column.name;
    }
}
