import { Expression, ExpressionUtils, ReturnExpression } from "lambda-expression";
import { Utils, ValueTypeToParse } from "./core/utils";
import { MapperTable } from "./mapper-table";
import { DatabaseHelper } from "./database-helper";
import { MapperColumn } from "./mapper-column";
import { FieldType } from "./core/enums/field-type";
import { PrimaryKeyType } from "./core/enums/primary-key-type";
import { GetMapper } from "./mapper/interface-get-mapper";
import { DatabaseBuilderError } from "./core/errors";
import { DEPENDENCY_LIST_SIMPLE_COLUMNS, DependencyListSimpleModel } from "./definitions/dependency-definition";
import { MetadataTableBase } from "./metadata-table-base";
import { WhereBuilder } from "./crud/where-builder";

export class MetadataTable<T> extends MetadataTableBase<T> {

    public instance: T;

    private _autoMapperCalled = false;

    private _expressionUtils: ExpressionUtils = new ExpressionUtils();

    constructor(
        _newable: new () => T,
        private _databaseHelper: DatabaseHelper,
        private _getMapper: GetMapper,
        public readOnly: boolean = false
    ) {
        super(_newable);
        this.instance = new _newable();
        this.mapperTable = new MapperTable(_newable.name);
    }

    public column<TReturn>(
        expression: ReturnExpression<TReturn, T>,
        type?: new () => TReturn,
        primaryKeyType?: PrimaryKeyType
    ): MetadataTable<T> {
        const column = this.columnName(expression);
        this.mapperTable.addColumn(
            column,
            type
                ? this._databaseHelper.getFieldType(type)
                : this.getTypeByExpression(this.instance, this.validExpressionMapper(this.instance, expression)),
            primaryKeyType
        );
        return this;
    }

    public hasQueryFilter(
        whereCallback: (where: WhereBuilder<T>) => void
    ): MetadataTable<T> {
        const instanceWhere: WhereBuilder<T> = new WhereBuilder(this.newable, Utils.REPLACEABLE_ALIAS);
        instanceWhere.scope(scope => {
            whereCallback(scope);
        });
        this.mapperTable.queryFilter = instanceWhere.compile();
        return this;
    }

    public hasMany<TArray, TReturn extends TArray[]>(
        expression: ReturnExpression<TReturn, T>,
        type: new () => TArray,
        tableName: string,
    ): MetadataTable<T> {
        let mapperColumn: MapperColumn = {
            column: this.columnName(expression),
            fieldType: this._databaseHelper.getFieldType(type)
        } as MapperColumn;
        const instanceMapper = this.validInstanceMapper(type ? new type() : expression(this.instance), mapperColumn.column);
        if (!this._databaseHelper.isTypeSimpleByType(mapperColumn.fieldType)) {
            mapperColumn = this.getMapperColumnReference(instanceMapper, `${mapperColumn.column}[?]`);
        }
        this.addDependencyArray(
            mapperColumn.column,
            FieldType.ARRAY | mapperColumn.fieldType,
            tableName
        );
        return this;
    }

    public referenceKey<TKey, TReturn>(
        expression: ReturnExpression<TKey, T>,
        expressionKey: ReturnExpression<TReturn, TKey>,
        type?: new () => TReturn
    ): MetadataTable<T> {
        const columnReference = this.columnName(expression);
        const columnKey = this.columnName(expressionKey);
        const column = `${columnReference}_${columnKey}`;
        const instance = this.validInstanceMapper(this.instance, column);
        let fieldType: FieldType;
        if (type) {
            fieldType = this._databaseHelper.getFieldType(type);
        } else {
            const referenceInstance = this.validExpressionMapper(instance, expression)(instance);
            const mapperReference = this.getMapper(referenceInstance.constructor.name);
            const mapperColumnReference = mapperReference.mapperTable.getColumnByField(expressionKey);
            fieldType = mapperColumnReference
                ? mapperColumnReference.fieldType
                : this.getTypeByExpression(referenceInstance, this.validExpressionMapper(referenceInstance, expressionKey));
        }
        this.addReference(
            column,
            fieldType
        );
        return this;
    }

    public reference<TReturn>(
        expression: ReturnExpression<TReturn, T>,
        type?: new () => TReturn
    ): MetadataTable<T> {
        const column = this.columnName(expression);
        this.mapperReference(this.validInstanceMapper(type ? new type() : expression(this.instance), column), column);
        return this;
    }

    public key<TReturn>(
        expression: ReturnExpression<TReturn, T>,
        primaryKeyType: PrimaryKeyType = PrimaryKeyType.AutoIncrement,
        type?: new () => TReturn
    ): MetadataTable<T> {
        if (this._autoMapperCalled) {
            throw new DatabaseBuilderError(`Mapper '${this.newable.name}', column key must be informed before the call to 'autoMapper()'`);
        }
        return this.column(
            expression, type,
            primaryKeyType
        );
    }

    public ignore<TReturn>(
        expression: ReturnExpression<TReturn, T>
    ): MetadataTable<T> {
        const instanceExpression = this.validExpressionMapper(this.instance, expression)(this.instance);
        const mapperColumn =
            instanceExpression && (!this._databaseHelper.isTypeSimple(instanceExpression as any))
                ? this.getMapperColumnReference(instanceExpression, this.columnName(expression))
                : new MapperColumn(this.columnName(expression));
        if (mapperColumn) {
            this.mapperTable.removeColumn(mapperColumn.column);
        }
        return this;
    }

    public autoMapper(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true
    ): MetadataTable<T> {
        if (this.mapperTable.keyColumns().length === 0) {
            throw new DatabaseBuilderError(`Mapper '${this.newable.name}', no column as key was informed to the Mapper`);
        }
        this.autoMapperColumns(references, referencesId, referencesIdRecursive);
        this._autoMapperCalled = true;
        return this;
    }

    protected getTypeByValue(value: ValueTypeToParse): FieldType {
        return this._databaseHelper.getType(value);
    }

    private validInstanceMapper<TType>(instance: TType, propertyMapperForMessage: string): TType {
        if (Utils.isNull(instance)) {
            throw new DatabaseBuilderError(`Mapper: ${this.newable.name}, can not get instance of mapped property ('${propertyMapperForMessage}')`);
        }
        return instance;
    }

    private validExpressionMapper<TReturn, TType>(
        instance: TType, expression: ReturnExpression<TReturn, TType>
    ): ReturnExpression<TReturn, TType> {
        const expressionByInstance = expression(instance);
        if (Utils.isNull(expression) || Utils.isNull(expressionByInstance)) {
            throw new DatabaseBuilderError(`Mapper: ${this.newable.name}, can not get instance of mapped property ('${this.columnName(expression)}')`);
        }
        return expression;
    }

    private columnName<TReturn, TType>(expression: ReturnExpression<TReturn, TType>): string {
        return this._expressionUtils.getColumnByExpression(expression, "_");
    }

    private getTypeByExpression<TType>(instance: any, expression: Expression<TType>): FieldType {
        return this._databaseHelper.getType(
            this._databaseHelper.getValue(
                instance, this._expressionUtils.getColumnByExpression(expression, ".")
            )
        );
    }

    private getMapper(keyMapper: string) {
        return this._getMapper.get(keyMapper);
    }

    private isKeyColumn(key: string) {
        return (this.mapperTable.keyColumns().filter(x => x.column === key).length > 0);
    }

    private autoMapperColumns(
        references: boolean = true,
        referencesId: boolean = true,
        referencesIdRecursive: boolean = true
    ): void {
        for (const key in this.instance) {
            if (key !== "constructor" && typeof this.instance[key] !== "function") {
                if (
                    this._databaseHelper.isTypeSimple(this.instance[key] as any)
                    || references
                ) {
                    if (!this.isKeyColumn(key)) {
                        this.mapperTable.addColumn(key, this.getTypeByValue(this.instance[key] as any));
                    }
                }
            }
        }
        if (referencesId) {
            this.autoColumnsModelReferencesRecursive(this.instance, "", referencesIdRecursive);
        }
    }

    private addReference(
        name: string,
        fieldType: FieldType
    ) {
        this.mapperTable.addColumn(
            name,
            fieldType
        );
    }

    private mapperReference<TRef>(
        instanceMapper: TRef,
        propertyName: string,
        ascendingRefName: string = "",
    ) {
        const mapperColumn = this.getMapperColumnReference(instanceMapper, propertyName);
        if (mapperColumn) {
            this.addReference(
                `${ascendingRefName}${mapperColumn.column}`,
                mapperColumn.fieldType
            );
        }
    }

    private getMapperColumnReference<TRef>(
        instanceMapper: TRef,
        propertyName: string
    ): MapperColumn {
        if (this._databaseHelper.isTypeSimple(instanceMapper as any)) {
            throw new DatabaseBuilderError(`Mapper '${this.newable.name}', it is not allowed to map property '${propertyName}' of type '${instanceMapper.constructor.name}' as a reference. For it is not of a composite type (Ex: object)`);
        }
        const mapperKey = this.getMapper(instanceMapper.constructor.name);
        if (!Utils.isNull(mapperKey)) {
            if (Utils.isNull(mapperKey.mapperTable.keyColumns()) || mapperKey.mapperTable.keyColumns().length < 1) {
                throw new DatabaseBuilderError(`Mapper '${this.newable.name}', not key column for property '${propertyName}' of type '${instanceMapper.constructor.name}'`);
            }
            if (mapperKey.mapperTable.keyColumns().length > 1) {
                throw new DatabaseBuilderError(`Mapper '${this.newable.name}', composite Id not supported (property '${propertyName}' of type '${instanceMapper.constructor.name}')`);
            }
            const keyMapped = mapperKey.mapperTable.keyColumns()[0];
            return new MapperColumn(
                `${propertyName}_${keyMapped.column}`,
                keyMapped.fieldType
            );
        } else {
            if (!this._databaseHelper.isTypeIgnoredInMapper(instanceMapper as any)) {
                throw new DatabaseBuilderError(`Mapper '${this.newable.name}', key '${propertyName}' of type '${instanceMapper.constructor.name}' not before mapped`);
            }
        }
        return void 0;
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
                        this.mapperReference(keyInstanceMapper, key, ascendingRefName);
                    }
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

    private addDependencyArray(
        name: string,
        fieldType: FieldType,
        tablename: string
    ) {
        this.mapperTable.addColumn(name, fieldType, void 0, void 0, tablename);
        const dependency = new MapperTable(tablename);
        fieldType &= ~FieldType.ARRAY;
        dependency.addColumn(DEPENDENCY_LIST_SIMPLE_COLUMNS.INDEX, FieldType.NUMBER, PrimaryKeyType.Assigned,
            Utils.getFieldExpression<DependencyListSimpleModel>(x => x.index));
        dependency.addColumn(DEPENDENCY_LIST_SIMPLE_COLUMNS.VALUE, fieldType, void 0,
            Utils.getFieldExpression<DependencyListSimpleModel>(x => x.value));
        const keyColumns = this.mapperTable.keyColumns();
        if (keyColumns.length < 1) {
            throw new DatabaseBuilderError(`It is not possible to create a dependency mapper ("${name}") if the primary key of the parent entity ("${this.mapperTable.tableName}") is not yet mapped.`);
        }
        if (keyColumns.length > 1) {
            throw new DatabaseBuilderError(`Dependency mapper ("${name}") not support relation with entity ("${this.mapperTable.tableName}") with composite key [${keyColumns.join(", ")}]!`);
        }
        dependency.addColumn(
            DEPENDENCY_LIST_SIMPLE_COLUMNS.REFERENCE(this.mapperTable.tableName, keyColumns[0].column),
            keyColumns[0].fieldType, PrimaryKeyType.Assigned,
            Utils.getFieldExpression<DependencyListSimpleModel>(x => x.reference));
        this.mapperTable.dependencies.push(dependency);
    }
}
