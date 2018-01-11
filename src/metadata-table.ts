import { Expression, ExpressionUtils } from 'lambda-expression';
import { FieldType, ValueTypeToParse } from './core/utils';
import { MapperTable } from './mapper-table';
import { DatabaseHelper } from './database-helper';
import { MapperColumn } from './mapper-column';

export class MetadataTable<T> {

    private _expressionUtils: ExpressionUtils = new ExpressionUtils();

    public instance: any;

    public mapperTable: MapperTable;

    constructor(
        public newable: new () => T,
        private _databaseHelper: DatabaseHelper,
        public readOnly: boolean = false,
        public keyColumn: string = "key"
    ) {
        this.instance = new newable();
        this.mapperTable = new MapperTable(newable.name);
    }

    public mapper(expression: Expression<T>): MetadataTable<T> {
        let column = this._expressionUtils.getColumnByExpression(expression, "_");
        let field = this._expressionUtils.getColumnByExpression(expression, ".");
        this.setColumn(column, this.getTypeByValue(this._databaseHelper.getValue(this.instance, field)))
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

    private autoMapperColumns(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true,
        referencesIdColumn: string = "id"
    ): void {
        for (var key in this.instance) {
            if (key != 'constructor' && typeof this.instance[key] != 'function') {
                let type = this._databaseHelper.getType(this.instance[key]);
                if (((type != FieldType.OBJECT)
                    || references)
                    && key != this.keyColumn) {
                    this.setColumn(key, this.getTypeByValue(this.instance[key]));
                }
            }
        };
        if (referencesId) {
            this.autoColumnsModelReferencesRecursive(this.instance, "", referencesIdRecursive, referencesIdColumn);
        }
    }

    private autoColumnsModelReferencesRecursive(
        instanceMapper: any,
        ascendingRefName: string,
        recursive: boolean, referencesIdColumn: string
    ) {
        for (var key in instanceMapper) {
            if (key != 'constructor' && typeof instanceMapper[key] != 'function') {
                if (
                    (instanceMapper[key] instanceof Object && instanceMapper[key].hasOwnProperty(referencesIdColumn))) {
                    this.setColumn(
                        `${ascendingRefName}${key}_${referencesIdColumn}`,
                        this.getTypeByValue(instanceMapper[key][referencesIdColumn])
                    );
                }
                if (recursive && instanceMapper[key] instanceof Object) {
                    this.autoColumnsModelReferencesRecursive(
                        instanceMapper[key], `${ascendingRefName}${key}_`,
                        recursive, referencesIdColumn);
                }
            }
        };
    }

    protected getTypeByValue(value: ValueTypeToParse): FieldType {
        return this._databaseHelper.getType(value);
    }

    private setColumn(
        name: string,
        fieldType: FieldType) {
        this.mapperTable.columns.push(new MapperColumn(name, fieldType));
    }
}