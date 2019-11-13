import { DatabaseCreatorContract } from "../definitions/database-creator-contract";
import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseBaseTransaction, DatabaseObject, DatabaseResult } from "../definitions/database-definition";
import { SQLite3Interface, SQLite3ObjectInterface } from "../definitions/sqlite3-interface";
import { ManagedTransaction } from "../transaction/managed-transaction";
import { QueryHelper } from "../core/query-helper";

/**
 * Adapter for https://www.npmjs.com/package/sqlite3
 *
 * Example usage:
 *
 * `new SQLite3DatabaseAdapter(sqlite3.Database);`
 * @export
 * @class SQLite3DatabaseAdapter
 * @implements {DatabaseCreatorContract}
 */
export class SQLite3DatabaseAdapter implements DatabaseCreatorContract {

    constructor(private _sqlite: SQLite3Interface) {

    }

    public create(config: DatabaseConfig): Promise<DatabaseObject> {
        return new Promise<DatabaseObject>((resolve, reject) => {
            const database = new this._sqlite(config.name,
                err => reject(err));
            const databaseObject = {
                executeSql: (statement: string, params: any): Promise<DatabaseResult> => {
                    return this.executeSql(database, statement, params);
                },
                transaction: (fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> => {
                    return new Promise<any>((resolve, reject) => {
                        this.executeSql(database, "BEGIN TRANSACTION", [])
                            .then(_ => {
                                try {
                                    fn(
                                        {
                                            executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                                                return this.executeSql(database, sql, Array.isArray(values) ? values : []);
                                            }
                                        }
                                    );
                                    this.executeSql(database, "COMMIT", [])
                                        .then(_ => resolve())
                                        .catch(err => reject(err));
                                } catch (error) {
                                    this.executeSql(database, "ROLLBACK", [])
                                        .then(_ => resolve())
                                        .catch(err => reject(err));
                                }
                            })
                            .catch(err => reject(err));
                    });
                },
                sqlBatch: (sqlStatements: any[]) => {
                    return this.batch(database, sqlStatements, true);
                }
            } as DatabaseObject;
            databaseObject.managedTransaction = () => {
                return new ManagedTransaction(databaseObject);
            };
            resolve(databaseObject);
        });
    }

    private executeSql(
        database: SQLite3ObjectInterface,
        statement: string,
        params: any
    ): Promise<DatabaseResult> {
        // console.log("execute::: ", statement, params);
        if (this.isSelect(statement)) {
            return this.query(database, statement, params);
        }
        return new Promise((resolve, reject) => {
            this.batch(database, [[statement, params]], false)
                .then(result =>
                    resolve(
                        result
                            ? result.reduce(
                                (a, b) => {
                                    return this.createDatabaseResult(
                                        [], a.rowsAffected + b.rowsAffected, b.insertId
                                    );
                                },
                                this.createDatabaseResult([], 0, void 0)
                            )
                            : this.createDatabaseResult([], 0, void 0)
                    )
                )
                .catch(err => reject(err));
        });
    }

    private batch(
        database: SQLite3ObjectInterface,
        sqlStatements: Array<string | string[] | any>,
        runInTransaction: boolean
    ): Promise<DatabaseResult[]> {
        if (!sqlStatements || sqlStatements.constructor !== Array) {
            throw Error("sqlBatch expects an array");
        }
        const batchList = [];
        for (const st of sqlStatements) {
            if (st.constructor === Array) {
                if (st.length === 0) {
                    throw Error("sqlBatch array element of zero (0) length");
                }
                batchList.push(
                    {
                        sql: st[0],
                        params: st.length === 0 ? [] : st[1]
                    }
                );
            } else {
                batchList.push({
                    sql: st,
                    params: []
                });
            }
        }
        return this.executeBatchs(database, batchList, runInTransaction);
    }

    private async executeBatchs(
        database: SQLite3ObjectInterface,
        batchs: Array<{ sql: string, params: any[] }>,
        runInTransaction: boolean
    ): Promise<DatabaseResult[]> {
        const result: DatabaseResult[] = [];
        if (runInTransaction) {
            await this.beginTransaction(database);
        }
        for (const batch of batchs) {
            result.push(await this.executeBatch(database, batch));
        }
        if (runInTransaction) {
            await this.commitTransaction(database);
        }
        return result;
    }

    private executeBatch(
        database: SQLite3ObjectInterface, batch: { sql: string, params: any[] }
    ): Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            const that = this;
            const cmd = QueryHelper.compileWithoutParams(batch.sql, batch.params);
            console.log("cmd:::", cmd);
            if (cmd.startsWith("INSERT ")) {
                debugger;
            }
            database.run(cmd, [], function (err: Error | null) {
                if (err) {
                    reject(err);
                } else {
                    resolve(
                        that.createDatabaseResult([], this.changes, this.lastID)
                    );
                }
            });
        });
    }

    private query(database: SQLite3ObjectInterface, sql: string, params: any[]): Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            database.all(sql, params, (err: Error | null, rows: any[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(
                        this.createDatabaseResult(rows)
                    );
                }
            });
        });
    }

    private isSelect(sql: string): boolean {
        return /select/i.test(sql);
    }

    private createDatabaseResult(
        rows: any[],
        rowsAffected: number = 0,
        insertId: any = void 0
    ): DatabaseResult {
        return {
            rows: {
                length: rows.length,
                item: (index: number) => {
                    return rows[index];
                }
            },
            rowsAffected,
            insertId
        } as DatabaseResult;
    }

    private beginTransaction(database: SQLite3ObjectInterface): Promise<DatabaseResult> {
        return this.executeBatch(database, { sql: "BEGIN TRANSACTION", params: [] });
    }

    private commitTransaction(database: SQLite3ObjectInterface): Promise<DatabaseResult> {
        return this.executeBatch(database, { sql: "COMMIT", params: [] });
    }

    // private rollbackTransaction(database: SQLite3ObjectInterface): Promise<DatabaseResult> {
    //     return this.executeBatch(database, { sql: "ROLLBACK", params: [] });
    // }
}
