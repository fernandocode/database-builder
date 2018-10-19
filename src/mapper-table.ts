import { MapperColumn } from "./mapper-column";
import { ExpressionOrColumn, Utils } from "./core/utils";
import { FieldType } from "./core/enums/field-type";
import { DatabaseBuilderError } from "./core/errors";
import { PrimaryKeyType } from "./core/enums/primary-key-type";
import { ExpressionOrColumnEnum } from "./core/enums/expression-or-column-enum";
import { Expression } from "lambda-expression";

export class MapperTable {

    public columns: MapperColumn[] = [];
    public dependencies: MapperTable[] = [];

    constructor(
        public tableName: string = void 0,
    ) {

    }

    public addColumn(
        name: string,
        fieldType: FieldType,
        primaryKeyType?: PrimaryKeyType,
        fieldReference?: string,
        tableReference?: string
    ) {
        this.add(
            new MapperColumn(
                name, fieldType, fieldReference,
                primaryKeyType, tableReference
            )
        );
    }

    public removeColumn(columnName: string) {
        if (this.hasColumn(columnName)) {
            const index = this.columns.findIndex(x => x.column === columnName);
            if (index > -1) {
                this.columns.splice(index, 1);
            }
        }
    }

    public getColumnNameByField<T, TReturn>(expression: ExpressionOrColumn<TReturn, T>): string {
        return this.getColumnByField(expression).column;
    }

    public getColumnByField<T, TReturn>(expression: ExpressionOrColumn<TReturn, T>): MapperColumn {
        const expressionField = Utils.expressionOrColumn(expression) === ExpressionOrColumnEnum.Expression
            ? Utils.getFieldExpression<T>(expression as Expression<T>)
            : expression as string;
        return this.findColumn(x => x.fieldReference === expressionField);
    }

    private getColumn(columnName: string): MapperColumn {
        return this.findColumn(x => x.column === columnName);
    }

    private findColumn(predicate: (value: MapperColumn, index: number, obj: MapperColumn[]) => boolean): MapperColumn {
        return this.columns.find(predicate);
    }

    private hasColumn(columnName: string): boolean {
        return this.getColumn(columnName) !== void 0;
    }

    private add(
        mapperColumn: MapperColumn
    ) {
        if (Utils.isFlag(mapperColumn.fieldType, FieldType.NULL)) {
            throw new DatabaseBuilderError(`Mapper: ${this.tableName}, can not get instance of mapped column ('${mapperColumn.column}')`);
        }
        if (this.hasColumn(mapperColumn.column)) {
            throw new DatabaseBuilderError(`Mapper: ${this.tableName}, duplicate column: '${mapperColumn.column}'`);
        }
        this.columns.push(mapperColumn);
    }

}
