import { Expression, ExpressionUtils, ReturnExpression } from "lambda-expression";
import { ValueTypeToParse } from "./core/utils";
import { MapperTable } from "./mapper-table";
import { DatabaseHelper } from "./database-helper";
import { MapperColumn } from "./mapper-column";
import { FieldType } from "./core/enums/field-type";
import { DatabaseBuilderError, GetMapper } from ".";

export class MetadataTable<T> {

    public instance: any;

    public mapperTable: MapperTable;

    private _autoMapperCalled = false;

    private _expressionUtils: ExpressionUtils = new ExpressionUtils();

    constructor(
        public newable: new () => T,
        private _databaseHelper: DatabaseHelper,
        private _getMapper: GetMapper,
        public readOnly: boolean = false
    ) {
        this.instance = new newable();
        this.mapperTable = new MapperTable(newable.name);
    }

    public column<TReturn>(
        expression: ReturnExpression<TReturn, T>,
        type?: new () => TReturn,
        isPrimaryKey?: boolean,
        isAutoIncrement?: boolean
    ): MetadataTable<T> {
        const column = this.columnName(expression);
        const validExpression = (expression: ReturnExpression<TReturn, T>): ReturnExpression<TReturn, T> => {
            if (expression === void 0 || expression(this.instance) === void 0) {
                throw new DatabaseBuilderError(`Mapper: ${this.newable.name}, can not get instance of mapped property ('${column}')`);
            }
            return expression;
        };
        this.addColumn(
            column,
            type ? this._databaseHelper.getFieldType(type) : this.getTypeByExpression(validExpression(expression)),
            isPrimaryKey, isAutoIncrement);
        return this;
    }

    public reference<TReturn>(
        expression: ReturnExpression<TReturn, T>,
        type?: new () => TReturn
    ): MetadataTable<T> {
        const column = this.columnName(expression);
        const validInstance = (instance: TReturn): TReturn => {
            if (instance === void 0) {
                throw new DatabaseBuilderError(`Mapper: ${this.newable.name}, can not get instance of mapped property ('${column}')`);
            }
            return instance;
        };
        this.mapperReference(validInstance(type ? new type() : expression(this.instance)), column);
        return this;
    }

    public key<TReturn>(
        expression: ReturnExpression<TReturn, T>,
        isAutoIncrement?: boolean,
        type?: new () => TReturn
    ): MetadataTable<T> {
        if (this._autoMapperCalled) {
            throw new DatabaseBuilderError(`Mapper '${this.newable.name}', column key must be informed before the call to 'autoMapper()'`);
        }
        return this.column(expression, type, true, isAutoIncrement);
    }

    public ignore<TReturn>(
        expression: ReturnExpression<TReturn, T>
    ): MetadataTable<T> {
        const column = this.columnName(expression);
        this.removeColumn(column);
        return this;
    }

    public autoMapper(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true
    ): MetadataTable<T> {
        if (this.keyColumns().length === 0) {
            throw new DatabaseBuilderError(`Mapper '${this.newable.name}', no column as key was informed to the Mapper`);
        }
        this.autoMapperColumns(references, referencesId, referencesIdRecursive);
        this._autoMapperCalled = true;
        return this;
    }

    protected getTypeByValue(value: ValueTypeToParse): FieldType {
        return this._databaseHelper.getType(value);
    }

    private columnName<TReturn>(expression: ReturnExpression<TReturn, T>): string {
        return this._expressionUtils.getColumnByExpression(expression, "_");
    }

    private getTypeByExpression(expression: Expression<T>): FieldType {
        return this._databaseHelper.getType(
            this._databaseHelper.getValue(
                this.instance, this._expressionUtils.getColumnByExpression(expression, ".")
            )
        );
    }

    private getMapper(keyMapper: string) {
        return this._getMapper.get(keyMapper);
    }

    private keyColumns(): MapperColumn[] {
        return this.mapperTable.columns.filter(x => x.isKeyColumn);
    }

    private isKeyColumn(key: string) {
        return (this.keyColumns().filter(x => x.column === key).length > 0);
    }

    private autoMapperColumns(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true
    ): void {
        for (const key in this.instance) {
            if (key !== "constructor" && typeof this.instance[key] !== "function") {
                if (
                    this._databaseHelper.isTypeSimple(this.instance[key])
                    || references
                ) {
                    if (!this.isKeyColumn(key)) {
                        this.addColumn(key, this.getTypeByValue(this.instance[key]));
                    }
                }
            }
        }
        if (referencesId) {
            this.autoColumnsModelReferencesRecursive(this.instance, "", referencesIdRecursive);
        }
    }

    private mapperReference<TReturn>(
        instanceMapper: any,
        propertyName: string,
        ascendingRefName: string = "",
    ) {
        if (!this._databaseHelper.isTypeSimple(instanceMapper)) {
            const mapperKey = this.getMapper(instanceMapper.constructor.name);
            if (mapperKey !== void 0) {
                if (mapperKey.keyColumns() === void 0 || mapperKey.keyColumns().length < 1) {
                    throw new DatabaseBuilderError(`Mapper '${this.newable.name}', not key column for property '${propertyName}' the type '${instanceMapper.constructor.name}'`);
                }
                if (mapperKey.keyColumns().length > 1) {
                    throw new DatabaseBuilderError(`Mapper '${this.newable.name}', composite Id not supported (property '${propertyName}' the type '${instanceMapper.constructor.name}')`);
                }
                const keyMapped = mapperKey.keyColumns()[0];
                this.addColumn(
                    `${ascendingRefName}${propertyName}_${keyMapped.column}`,
                    keyMapped.fieldType
                );
            } else {
                if (!this._databaseHelper.isTypeIgnoredInMapper(instanceMapper)) {
                    throw new DatabaseBuilderError(`Mapper '${this.newable.name}', key '${propertyName}' the type '${instanceMapper.constructor.name}' not before mapped`);
                }
            }
        }
    }

    private autoColumnsModelReferencesRecursive(
        instanceMapper: any,
        ascendingRefName: string,
        recursive: boolean
    ) {
        const newable: new () => T = (instanceMapper as any).constructor;
        for (const key in instanceMapper) {
            if (instanceMapper.hasOwnProperty(key)) {
                const keyInstanceMapper = instanceMapper[key];

                if (key !== "constructor" && typeof keyInstanceMapper !== "function") {
                    this.mapperReference(keyInstanceMapper, key, ascendingRefName);
                    if (recursive && !this._databaseHelper.isTypeSimple(keyInstanceMapper as any)) {
                        this.autoColumnsModelReferencesRecursive(
                            keyInstanceMapper,
                            `${ascendingRefName}${key}_`,
                            recursive);
                    }
                }
            }
        }
    }

    private hasColumn(columnName: string): boolean {
        return this.getColumn(columnName) !== void 0;
    }

    private getColumn(columnName: string): MapperColumn {
        return this.mapperTable.columns.find(x => x.column === columnName);
    }

    private removeColumn(columnName: string) {
        if (this.hasColumn(columnName)) {
            const index = this.mapperTable.columns.findIndex(x => x.column === columnName);
            if (index > -1) {
                this.mapperTable.columns.splice(index, 1);
            }
        }
    }

    private addColumn(
        name: string,
        fieldType: FieldType,
        isPrimaryKey?: boolean,
        isAutoIncrement?: boolean
    ) {
        if (fieldType === FieldType.NULL) {
            throw new DatabaseBuilderError(`Mapper: ${this.newable.name}, can not get instance of mapped column ('${name}')`);
        }
        if (this.hasColumn(name)) {
            throw new DatabaseBuilderError(`Mapper: ${this.newable.name}, duplicate column: '${name}'`);
        }
        this.mapperTable.columns.push(
            new MapperColumn(
                name, fieldType, void 0,
                isPrimaryKey, isAutoIncrement
            )
        );
    }
}
