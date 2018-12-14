import { MapperTable } from "../../mapper-table";
import { RowResult } from "../../core/row-result";
import { DatabaseResult } from "../../definitions/database-definition";
import { MetadataTable } from "../../metadata-table";
import { QueryBuilderBaseContract } from "./query-builder-base-contract";

export class QueryReadableBuilderBase {

    constructor(
        public enableLog: boolean = true,
    ) {
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
        getMapper: (tKey: (new () => any) | string) => MetadataTable<any>,
        query: QueryBuilderBaseContract<any, any>
    ): any {
        const items: any[] = [];
        this.forCursor(cursor, (item) => {
            items.push(mapper(new RowResult(item, mapperTable, getMapper, query)));
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
            const item = new RowResult(row, mapperTable).read(newable);
            // const item = this.parseToObject(row, newable, mapperTable);
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

    protected log(log: any) {
        if (this.enableLog) {
            // tslint:disable-next-line
            console.log(log);
        }
    }
}
