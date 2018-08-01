import { Expression, ExpressionUtils } from "lambda-expression";
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

    public mapper(
        expression: Expression<T>,
        isPrimaryKey?: boolean,
        isAutoIncrement?: boolean
    ): MetadataTable<T> {
        const column = this._expressionUtils.getColumnByExpression(expression, "_");
        const field = this._expressionUtils.getColumnByExpression(expression, ".");
        this.setColumn(
            column, this.getTypeByValue(this._databaseHelper.getValue(this.instance, field)),
            isPrimaryKey, isAutoIncrement);
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

    public key(
        expression: Expression<T>,
        isAutoIncrement?: boolean
    ): MetadataTable<T> {
        if (this._autoMapperCalled) {
            throw new DatabaseBuilderError(`Mapper '${this.newable.name}', column key must be informed before the call to 'autoMapper()'`);
        }
        return this.mapper(expression, true, isAutoIncrement);
    }

    protected getTypeByValue(value: ValueTypeToParse): FieldType {
        return this._databaseHelper.getType(value);
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
                        this.setColumn(key, this.getTypeByValue(this.instance[key]));
                    }
                }
            }
        }
        if (referencesId) {
            this.autoColumnsModelReferencesRecursive(this.instance, "", referencesIdRecursive);
        }
    }

    private autoColumnsModelReferencesRecursive(
        instanceMapper: any,
        ascendingRefName: string,
        recursive: boolean
    ) {
        for (const key in instanceMapper) {
            if (instanceMapper.hasOwnProperty(key)) {
                const keyInstanceMapper = instanceMapper[key];

                if (key !== "constructor" && typeof keyInstanceMapper !== "function") {
                    if (!this._databaseHelper.isTypeSimple(keyInstanceMapper)) {
                        const mapperKey = this.getMapper(keyInstanceMapper.constructor.name);
                        if (mapperKey !== void 0) {
                            if (mapperKey.keyColumns() === void 0 || mapperKey.keyColumns().length < 1) {
                                throw new DatabaseBuilderError(`Mapper '${this.newable.name}', not key column for Key '${key}' the type '${keyInstanceMapper.constructor.name}'`);
                            }
                            if (mapperKey.keyColumns().length > 1) {
                                throw new DatabaseBuilderError(`Mapper '${this.newable.name}', composite Id not supported (Key '${key}' the type '${keyInstanceMapper.constructor.name}')`);
                            }
                            const keyMapped = mapperKey.keyColumns()[0];
                            this.setColumn(
                                `${ascendingRefName}${key}_${keyMapped.column}`,
                                this.getTypeByValue(keyInstanceMapper[keyMapped.column]),
                            );
                        } else {
                            if (!this._databaseHelper.isTypeIgnoredInMapper(keyInstanceMapper)) {
                                throw new DatabaseBuilderError(`Mapper '${this.newable.name}', key '${key}' the type '${keyInstanceMapper.constructor.name}' not before mapped`);
                            }
                        }
                    }
                    if (recursive && !this._databaseHelper.isTypeSimple(keyInstanceMapper)) {
                        this.autoColumnsModelReferencesRecursive(
                            keyInstanceMapper, `${ascendingRefName}${key}_`,
                            recursive);
                    }
                }
            }
        }
    }

    private setColumn(
        name: string,
        fieldType: FieldType,
        isPrimaryKey?: boolean,
        isAutoIncrement?: boolean
    ) {
        this.mapperTable.columns.push(
            new MapperColumn(
                name, fieldType, void 0,
                isPrimaryKey, isAutoIncrement
            )
        );
    }
}
