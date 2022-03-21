import { ColumnsValuesBuilder } from "../../core/columns-values-builder";
import { Column } from "../../core/column";
import { PrimaryKeyType } from "../../core/enums/primary-key-type";
import { ValueTypeToParse, ExpressionOrColumn, Utils } from "../../core/utils";
import { DatabaseBuilderError } from "../../core";

export class UpdateColumnsBuilder<T> extends ColumnsValuesBuilder<T, UpdateColumnsBuilder<T>> {

    protected getInstance(): UpdateColumnsBuilder<T> {
        return this;
    }

    protected columnFormat(column: Column): string {
        return !!column.primaryKeyType ? void 0 : `${column.name} = ?`;
    }

    public set<TReturn extends ValueTypeToParse>(
        expression: ExpressionOrColumn<TReturn, T>,
        primaryKeyType?: PrimaryKeyType
    ): UpdateColumnsBuilder<T> {
        return this.setValue(
            expression,
            this.getValueByExpression(expression)[0],
            primaryKeyType
        );
    }    

    public setValue<TReturn extends ValueTypeToParse>(expression: ExpressionOrColumn<TReturn, T>, value: TReturn, primaryKeyType?: PrimaryKeyType)
        : UpdateColumnsBuilder<T> {
        if (Utils.isArray(value))
            throw new DatabaseBuilderError("value como Array não suportado")
        return super.setValue(expression, value, primaryKeyType);
    }
}
