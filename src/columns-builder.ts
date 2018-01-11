import { ColumnsValuesBuilder } from "./columns-values-builder";
import { Column } from "./utils";

export class UpdateColumnsBuilder<T> extends ColumnsValuesBuilder<T, UpdateColumnsBuilder<T>>{

    protected getInstance(): UpdateColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return `${column.name} = ?`;
    }
}

export class InsertColumnsBuilder<T> extends ColumnsValuesBuilder<T, InsertColumnsBuilder<T>>{

    protected getInstance(): InsertColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return column.name;
    }
}

export class DeleteColumnsBuilder<T> extends ColumnsValuesBuilder<T, DeleteColumnsBuilder<T>>{

    protected getInstance(): DeleteColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        throw new Error("Method not supported.");
    }
}