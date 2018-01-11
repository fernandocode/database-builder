import { MapperTable } from './mapper-table';
import { DatabaseHelper } from './database-helper';
import { ResultExecuteSql } from './utils';

export class QueryReadableBuilderBase{
    private _databaseHelper: DatabaseHelper;

    constructor(
        public enableLog: boolean = true
    ) {
        this._databaseHelper = new DatabaseHelper();
    }

    public toCast(cursor: ResultExecuteSql): any {
        let items: any[] = [];
        this.forCursor(cursor, (item) => {
            items.push(item);
        });
        return items;
    }

    public map(cursor: ResultExecuteSql, mapper: (row: any) => any): any {
        let items: any[] = [];
        this.forCursor(cursor, (item) => {
            items.push(mapper(item));
        });
        return items;
    }

    public read<TReader>(cursor: ResultExecuteSql, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        return this.readCursor(cursor, newable, mapperTable);
    }

    public readCursor<TReader>(cursor: ResultExecuteSql, newable: new () => TReader, mapperTable: MapperTable): TReader[] {
        let items: TReader[] = [];
        this.forCursor(cursor, (row) => {
            var item = this.parseToObject(row, newable, mapperTable);
            items.push(item);
        });
        return items;
    }

    public forCursor(cursor: ResultExecuteSql, forRow: (row: any) => void): void {
        // verificar se consulta retornou dados
        if (cursor && cursor.rows && cursor.rows.length) {
            for (var index = 0; index < cursor.rows.length; index++) {
                forRow(cursor.rows.item(index));
            }
        }
    }

    private parseToObject<TReader extends any>(row: any, newable: new () => TReader, mapperTable: MapperTable): TReader {
        let result: TReader = new newable();
        mapperTable.columns.forEach((column) => {
            // TODO: refatorar para recuperar valores de forma correta para objetos complexos
            // Exemplo: column: "cliente_cidade_uf_id", recuperar o valor para: "cliente.cidade.uf.id"
            result[column.column] = this._databaseHelper.databaseToValue(row[column.column], column.fieldType);
        });
        return result;
    }

    protected log(log: any) {
        if (this.enableLog)
            console.log(log);
    }
}