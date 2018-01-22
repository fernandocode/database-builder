import { Expression, ExpressionUtils } from "lambda-expression";
import { ValueTypeToParse } from "./core/utils";
import { MapperTable } from "./mapper-table";
import { DatabaseHelper } from "./database-helper";
import { MapperColumn } from "./mapper-column";
import { FieldType } from "./core/enums/field-type";

export class MetadataTable<T> {

    public instance: any;

    public mapperTable: MapperTable;

    private _expressionUtils: ExpressionUtils = new ExpressionUtils();

    constructor(
        public newable: new () => T,
        private _databaseHelper: DatabaseHelper,
        public readOnly: boolean = false,
        public keyColumn: string = "key",
    ) {
        this.instance = new newable();
        this.mapperTable = new MapperTable(newable.name);
    }

    public mapper(expression: Expression<T>): MetadataTable<T> {
        const column = this._expressionUtils.getColumnByExpression(expression, "_");
        const field = this._expressionUtils.getColumnByExpression(expression, ".");
        this.setColumn(column, this.getTypeByValue(this._databaseHelper.getValue(this.instance, field)));
        return this;
    }

    public autoMapper(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true,
        referencesIdColumn: string = "id"): MetadataTable<T> {
        this.autoMapperColumns(references, referencesId, referencesIdRecursive, referencesIdColumn);
        return this;
    }

    protected getTypeByValue(value: ValueTypeToParse): FieldType {
        return this._databaseHelper.getType(value);
    }

    private autoMapperColumns(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true,
        referencesIdColumn: string = "id",
    ): void {
        for (const key in this.instance) {
            if (key !== "constructor" && typeof this.instance[key] !== "function") {
                const type = this._databaseHelper.getType(this.instance[key]);
                if (((type !== FieldType.OBJECT)
                    || references)
                    && key !== this.keyColumn) {
                    this.setColumn(key, this.getTypeByValue(this.instance[key]));
                }
            }
        }
        if (referencesId) {
            this.autoColumnsModelReferencesRecursive(this.instance, "", referencesIdRecursive, referencesIdColumn);
        }
    }

    private autoColumnsModelReferencesRecursive(
        instanceMapper: any,
        ascendingRefName: string,
        recursive: boolean, referencesIdColumn: string,
    ) {
        for (const key in instanceMapper) {
            if (key !== "constructor" && typeof instanceMapper[key] !== "function") {
                if (
                    (instanceMapper[key] instanceof Object && instanceMapper[key].hasOwnProperty(referencesIdColumn))) {
                    this.setColumn(
                        `${ascendingRefName}${key}_${referencesIdColumn}`,
                        this.getTypeByValue(instanceMapper[key][referencesIdColumn]),
                    );
                }
                if (recursive && instanceMapper[key] instanceof Object) {
                    this.autoColumnsModelReferencesRecursive(
                        instanceMapper[key], `${ascendingRefName}${key}_`,
                        recursive, referencesIdColumn);
                }
            }
        }
    }

    private setColumn(
        name: string,
        fieldType: FieldType) {
        this.mapperTable.columns.push(new MapperColumn(name, fieldType));
    }
}
