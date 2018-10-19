import { MapperTable } from "../../mapper-table";
import { DatabaseHelper } from "../../database-helper";
import { RowResult } from "../../core/row-result";
import { DatabaseResult } from "../../definitions/database-definition";
import { ModelUtils } from "../../core/model-utils";

export class QueryReadableBuilderBase {
    private _databaseHelper: DatabaseHelper;

    constructor(
        public enableLog: boolean = true,
        // private _fetch: (model: any) => Promise<any>
    ) {
        this._databaseHelper = new DatabaseHelper();
    }

    public toCast(
        cursor: DatabaseResult,
    ): any {
        const items: any[] = [];
        this.forCursor(cursor, (item) => {
            items.push(item);
        });
        return items;
    }

    public map(
        cursor: DatabaseResult,
        mapper: (row: any) => any,
    ): any {
        const items: any[] = [];
        this.forCursor(cursor, (item) => {
            items.push(mapper(item));
        });
        return items;
    }

    public mapper(
        cursor: DatabaseResult,
        mapperTable: MapperTable,
        mapper: (row: RowResult<any>) => any,
    ): any {
        const items: any[] = [];
        this.forCursor(cursor, (item) => {
            items.push(mapper(new RowResult(item, mapperTable)));
        });
        return items;
    }

    public read<TReader>(
        cursor: DatabaseResult,
        newable: new () => TReader,
        mapperTable: MapperTable,
    ): TReader[] {
        return this.readCursor(cursor, newable, mapperTable);
    }

    public readCursor<TReader>(
        cursor: DatabaseResult,
        newable: new () => TReader,
        mapperTable: MapperTable,
    ): TReader[] {
        const items: TReader[] = [];
        this.forCursor(cursor, (row) => {
            const item = this.parseToObject(row, newable, mapperTable);
            items.push(item);
        });
        return items;
    }

    public forCursor(
        cursor: DatabaseResult,
        forRow: (row: any) => void,
    ): void {
        // verificar se consulta retornou dados
        if (cursor && cursor.rows && cursor.rows.length) {
            for (let index = 0; index < cursor.rows.length; index++) {
                forRow(cursor.rows.item(index));
            }
        }
    }

    private parseToObject<TReader extends any>(
        row: any, newable: new () => TReader,
        mapperTable: MapperTable,
    ): TReader {
        const result: TReader = newable ? new newable() : {} as TReader;
        mapperTable.columns.forEach((column) => {
            // TODO: refatorar para recuperar valores de forma correta para objetos complexos
            // Exemplo: column: "cliente_cidade_uf_id", recuperar o valor para: "cliente.cidade.uf.id"
            const value = this._databaseHelper.databaseToValue(row[column.column], column.fieldType);
            ModelUtils.set(result, column.fieldReference, value);
            // TODO: essa associação será redundante para itens de primeiro nivel, mas será mantida para compatibilidade com itens de segundo nivel ou mais, pois há mapper que buscam a propriedade de sub nivel pelo nome da coluna por exemplo: 'cliente_cidade_uf_id'
            // BREAKING-CHANGE: Na proxima versão da aplicação essa compatibilidade deve ser removida, o que era causar quebra de versão, onde terá que ser alterada implementações que o "mapper" para obter valores de propriedades de sub nivel.
            result[column.column] = value;
        });
        // return this._fetch(result);
        return result;
    }

    // private fetch<TReader>(models: TReader[], mapperTable: MapperTable, createQueryDepenendency: (dependency: MapperTable) => SqlExecutable): T[] {
    //     mapperTable.dependencies.forEach(dependency => {
    //         const columnDependency = mapperTable.columns.find(x => x.tableReference === dependency.tableName);
    //         // const valuesDependency: any[] = Utils.getValue(this.model(), columnDependency.fieldReference);
    //         models.forEach((model) => {
    //             const queryDependency = createQueryDepenendency(dependency);
    //             queryDependency.execute(database)
    //         });
    //     });
    //     return models;
    // }

    protected log(log: any) {
        if (this.enableLog) {
            // tslint:disable-next-line
            console.log(log);
        }
    }
}
