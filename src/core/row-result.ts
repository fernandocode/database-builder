import { MapperTable } from "../mapper-table";
import { ExpressionOrColumn, Utils } from "./utils";
import { FieldType } from "./enums/field-type";
import { DatabaseHelper } from "../database-helper";
import { MetadataTable } from "../metadata-table";
import { DatabaseBuilderError } from "./errors";
import { ModelUtils } from "./model-utils";
import { QueryBuilderBaseContract } from "../crud/query/query-builder-base-contract";
import { MapperUtils } from "../mapper/mapper-utils";

export class RowResult<T> {
    private _databaseHelper: DatabaseHelper;

    private _valueResultMap: T;

    constructor(
        private _valueT: T,
        private _mapper?: MapperTable,
        private _getMapper?: (tKey: (new () => any) | string) => MetadataTable<any>,
        private _query?: QueryBuilderBaseContract<any, any>
    ) {
        this._databaseHelper = new DatabaseHelper();
    }

    public parse<TReturn>(expression: ExpressionOrColumn<TReturn, T>, type: FieldType): TReturn {
        const value = Utils.getValue(this._valueT, expression);
        return this._databaseHelper.databaseToValue(value, type);
    }

    public autoParse<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        if (this._mapper) {
            const column = Utils.getColumn(expression);
            const value = Utils.getValue(this._valueT, column);
            return this._databaseHelper.databaseToValue(value, this._mapper.columns.find(x => x.column === column).fieldType);
        }
        // tslint:disable-next-line:no-console
        console.warn(`Auto parse not possible. (MapperTable not found)`);
        return this.get(expression);
    }

    public get<TReturn>(expression: ExpressionOrColumn<TReturn, T>): TReturn {
        return Utils.getValue(this._valueT, expression);
    }

    public coalesce<TReturn>(expression: ExpressionOrColumn<TReturn, T>, defaultValue: TReturn) {
        const value = this.get(expression);
        // tslint:disable-next-line:triple-equals
        return value == void 0 ? defaultValue : value;
    }

    public read<TReader extends any>(
        typeT: new () => TReader,
        alias: string = void 0
    ): TReader {
        if (alias === void 0 && this._query && MapperUtils.resolveKey(typeT) !== this._query.tablename) {
            alias = this._query.getAlias(typeT);
        }
        const mapperTable: MapperTable = this.getMapper(typeT);

        const result: TReader = typeT ? new typeT() : {} as TReader;
        mapperTable.columns.forEach((column) => {
            // TODO: refatorar para recuperar valores de forma correta para objetos complexos
            // Exemplo: column: "cliente_cidade_uf_id", recuperar o valor para: "cliente.cidade.uf.id"
            const value = new DatabaseHelper().databaseToValue(
                (this._valueT as any)[alias ? `${alias}_${column.column}` : column.column],
                column.fieldType);
            ModelUtils.set(result, column.fieldReference, value);
            // TODO: essa associação será redundante para itens de primeiro nivel, mas será mantida para compatibilidade com itens de segundo nivel ou mais, pois há mapper que buscam a propriedade de sub nivel pelo nome da coluna por exemplo: 'cliente_cidade_uf_id'
            // BREAKING-CHANGE: Na proxima versão da aplicação essa compatibilidade deve ser removida, o que era causar quebra de versão, onde terá que ser alterada implementações que o "mapper" para obter valores de propriedades de sub nivel.
            result[column.column] = value;
        });
        return result;
    }

    public map<TReader extends any>(
        typeT: new () => TReader,
        expression: ExpressionOrColumn<TReader, T>,
        alias: string = void 0
    ): RowResult<T> {
        const expressionField = Utils.getColumn(expression, ".");
        const value: TReader = this.read(typeT, alias);
        if (this._valueResultMap === void 0) {
            this._valueResultMap = {} as T;
        }
        if (expressionField && expressionField.length > 0) {
            ModelUtils.update(this._valueResultMap, expressionField, (v) => ModelUtils.mergeOverrideEmpty(v, value));
        } else {
            this._valueResultMap = value as any;
        }
        return this;
    }

    public result(): T {
        return this._valueResultMap || this._valueT;
    }

    private getMapper(typeT: new () => any): MapperTable {
        if (this._getMapper) {
            const mapper = this._getMapper(typeT);
            if (!mapper) {
                throw new DatabaseBuilderError(`Mapper not avaliable for type: "${typeT}"!`);
            }
            return mapper.mapperTable;
        }
        if (!this._mapper) {
            throw new DatabaseBuilderError("get mapper for type and mapper not avaliable!");
        }
        return this._mapper;
    }
}
