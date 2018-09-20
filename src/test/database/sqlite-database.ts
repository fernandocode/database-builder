import * as sqlite3 from "sqlite3";
import { DatabaseRowListTest } from "./database-row-list-test";
import { DatabaseResultTest } from "./database-result-test";
import { DatabaseBaseTransaction, DatabaseObject, DatabaseResult, DatabaseTransaction } from "../../definitions/database-definition";

export class SQLiteDatabase implements DatabaseObject {

    private db: sqlite3.Database;

    constructor() {
        this.db = new sqlite3.Database(":memory:");
    }

    public executeBatchs(batchs: Array<{ sql: string, params: any[] }>): Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            const promises: Array<Promise<any>> = [];
            for (const batch of batchs) {
                promises.push(this.executeBatch(batch));
            }
            Promise.all<DatabaseResult>(promises)
                .then(result => resolve(
                    result.reduce((a, b) => {
                        return {
                            rows: new DatabaseRowListTest([]),
                            rowsAffected: a.rowsAffected + b.rowsAffected,
                            insertId: b.insertId
                        } as DatabaseResult;
                    }, new DatabaseResultTest())
                ))
                .catch(err => reject(err));
        });
    }

    public executeBatch(batch: { sql: string, params: any[] }): Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            this.db.run(batch.sql, batch.params, function (err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve(new DatabaseResultTest(void 0, this.changes, this.lastID));
                }
            });
        });
    }

    public batch(sqlStatements: Array<string | string[] | any>): Promise<any> {
        if (!sqlStatements || sqlStatements.constructor !== Array) {
            throw Error("sqlBatch expects an array");
        }
        const batchList = [];
        for (const st of sqlStatements) {
            if (st.constructor === Array) {
                if (st.length === 0) {
                    throw Error("sqlBatch array element of zero (0) length");
                }
                batchList.push({
                    sql: st[0],
                    params: st.length === 0 ? [] : st[1]
                });
            } else {
                batchList.push({
                    sql: st,
                    params: []
                });
            }
        }

        return this.executeBatchs(batchList);
    }

    public query(sql: string, params: any[]): Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(
                        new DatabaseResultTest(
                            new DatabaseRowListTest(rows)
                        )
                    );
                }
            });
        });
    }

    public executeSql(statement: string, params: any): Promise<DatabaseResult> {
        if (this.isSelect(statement)) {
            return this.query(statement, params);
        }
        return this.batch([[statement, params]]);
    }
    public addTransaction(transaction: (tx: DatabaseTransaction) => void): void {
        // tslint:disable-next-line:no-console
        console.log("addTransaction");
    }
    public transaction(fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> {
        // tslint:disable-next-line:no-console
        console.log("transaction");
        return void 0;
    }
    public readTransaction(fn: (transaction: DatabaseTransaction) => void): Promise<any> {
        // tslint:disable-next-line:no-console
        console.log("readTransaction");
        return void 0;
    }
    public startNextTransaction(): void {
        // tslint:disable-next-line:no-console
        console.log("startNextTransaction");
    }

    public sqlBatch(sqlStatements: Array<string | string[] | any>): Promise<any> {
        // tslint:disable-next-line:no-console
        console.log("sqlBatch");

        return this.batch(sqlStatements);
    }

    public abortallPendingTransactions(): void {
        // tslint:disable-next-line:no-console
        console.log("abortallPendingTransactions");
    }

    private isSelect(sql: string): boolean {
        return /select/i.test(sql);
    }
}