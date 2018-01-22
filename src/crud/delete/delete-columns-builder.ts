import { ColumnsValuesBuilder } from "../../core/columns-values-builder";
import { Column } from "../../core/column";

export class DeleteColumnsBuilder<T> extends ColumnsValuesBuilder<T, DeleteColumnsBuilder<T>> {

    protected getInstance(): DeleteColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        throw new Error("Method not supported.");
    }
}
