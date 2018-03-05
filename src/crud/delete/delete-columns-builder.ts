import { ColumnsValuesBuilder } from "../../core/columns-values-builder";
import { Column } from "../../core/column";
import { DatabaseBuilderError } from "../../core/errors";

export class DeleteColumnsBuilder<T> extends ColumnsValuesBuilder<T, DeleteColumnsBuilder<T>> {

    protected getInstance(): DeleteColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        throw new DatabaseBuilderError("Method not supported.");
    }
}
