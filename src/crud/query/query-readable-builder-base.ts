import { MapperTable } from "./../../mapper-table";
import { DatabaseHelper } from "./../../database-helper";
import { DatabaseResult } from "../..";

export class QueryReadableBuilderBase {
    private _databaseHelper: DatabaseHelper;

    constructor(
        public enableLog: boolean = true,
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
        const result: TReader = new newable();
        mapperTable.columns.forEach((column) => {
            // TODO: refatorar para recuperar valores de forma correta para objetos complexos
            // Exemplo: column: "cliente_cidade_uf_id", recuperar o valor para: "cliente.cidade.uf.id"
            result[column.column] = this._databaseHelper.databaseToValue(row[column.column], column.fieldType);
        });
        return result;
    }

    protected log(log: any) {
        if (this.enableLog) {
            // tslint:disable-next-line
            console.log(log);
        }
    }
}
