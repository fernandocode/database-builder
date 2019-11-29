import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseResult } from "../definitions/database-definition";
import { WebSqlInterface, WebSqlObjectInterface, WebSqlTransactionInterface } from "../definitions/websql-interface";
import { DatabaseBuilderError } from "../core";
import { BaseDatabaseAdapter } from "./base-database.adapter";
import { QueryHelper } from "../core/query-helper";

/**
 * WARNING: Only for test app
 * Because WebSQL will no longer be implemented:
 * https://dev.w3.org/html5/webdatabase/
 *
 * Adapter for https://dev.w3.org/html5/webdatabase/
 *
 * Example usage:
 *
 * `new WebSqlDatabaseAdapter(this);`
 *
 * PS: 'this' is instance Browser, with method 'openDatabase'
 * @export
 * @class WebSqlDatabaseAdapter
 * @implements {DatabaseCreatorContract}
 */
export class WebSqlDatabaseAdapter extends BaseDatabaseAdapter<WebSqlObjectInterface> {

    constructor(
        private _creator: WebSqlInterface
    ) {
        super();
    }

    protected createDatabaseNative(
        config: DatabaseConfig
    ): Promise<WebSqlObjectInterface> {
        const databaseNative: WebSqlObjectInterface =
            /**
             * o método "openDatabase" precisa de 4 parametros:
             * 0: o nome do banco de dados
             * 1: a versão
             * 2: a descrição
             * 3: o tamanho estimado (em bytes)
             */
            this._creator.openDatabase(config.name, "1.0", config.name, 200000);
        // de qualquer forma, sempre teste que o objeto foi instanciado direito antes de usá-lo
        if (!databaseNative) {
            throw new DatabaseBuilderError("Não foi possivel iniciar o banco de dados no Browser!");
        }
        return Promise.resolve(databaseNative);
    }

    protected convertToExecuteSql(
        databaseNative: WebSqlObjectInterface
    ): (sql: string, values: any) => Promise<DatabaseResult> {
        return (sql: string, values: any): Promise<DatabaseResult> => {
            return new Promise<DatabaseResult>((executeSqlResolve, executeSqlReject) => {
                if (
                    sql.toUpperCase().indexOf("TRANSACTION") > -1
                    ||
                    sql.toUpperCase().indexOf("COMMIT") > -1
                    ||
                    sql.toUpperCase().indexOf("ROLLBACK") > -1
                ) {
                    this.ignoreExecuteSql(sql, values)
                        .then(result => executeSqlResolve(result))
                        .catch(err => executeSqlReject(err));
                } else {
                    databaseNative.transaction(transaction => {
                        return this.executeSql(transaction, sql, values)
                            .then(result => executeSqlResolve(result))
                            .catch(err => executeSqlReject(err));
                    });
                }
            });
        };
    }

    protected convertToTransaction(
        databaseNative: WebSqlObjectInterface
    ): (fn: (transaction: WebSqlTransactionInterface) => void) => Promise<any> {
        return (fn: (transaction: WebSqlTransactionInterface) => void): Promise<any> => {
            return databaseNative.transaction(transaction => {
                fn({
                    executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                        return this.executeSql(transaction, sql, values);
                    }
                });
            });
        };
    }

    protected convertToSqlBatch(
        databaseNative: WebSqlObjectInterface
    ): (sqlStatements: Array<(string | string[] | any)>) => Promise<DatabaseResult[]> {
        return (sqlStatements: any[]) => {
            return this.batch(databaseNative, sqlStatements, true);
        };
        // return (): Promise<DatabaseResult[]> => {
        //     throw new DatabaseBuilderError("Not implemented sqlBatch ");
        // };
    }

    protected executeSql(transaction: WebSqlTransactionInterface, sql: string, values: any): Promise<DatabaseResult> {
        return new Promise<DatabaseResult>((resolve, reject) => {
            transaction.executeSql(
                sql,
                Array.isArray(values) ? values : [],
                (_t: WebSqlTransactionInterface, r: any) => resolve(r),
                (_t: WebSqlTransactionInterface, err: any) => reject(err)
            );
        });
    }

    protected ignoreExecuteSql(sql: string, values: any): Promise<DatabaseResult> {
        return new Promise<DatabaseResult>((resolve, _reject) => {
            // tslint:disable-next-line: no-console
            console.warn(`command sql ignored: '${sql}', values: ${values}`);
            resolve({} as DatabaseResult);
        });
    }

    private batch(
        database: WebSqlObjectInterface,
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
        database: WebSqlObjectInterface,
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

    private async executeBatch(
        databaseNative: WebSqlObjectInterface, batch: { sql: string, params: any[] }
    ): Promise<DatabaseResult> {
        return await this.convertToExecuteSql(databaseNative)(batch.sql, batch.params);
        // return new Promise((resolve, reject) => {
        //     const that = this;
        // const cmd = QueryHelper.compileWithoutParams(batch.sql, batch.params);

        // databaseNative.transaction(transaction => {
        //     return this.executeSql(transaction, batch.sql, batch.params)
        //         .then(result => executeSqlResolve(result))
        //         .catch(err => executeSqlReject(err));
        // });
        // databaseNative.run(cmd, [], function (err: Error | null) {
        //     if (err) {
        //         reject(err);
        //     } else {
        //         resolve(
        //             that.createDatabaseResult([], this.changes, this.lastID)
        //         );
        //     }
        // });
        // });
    }

    private beginTransaction(database: WebSqlObjectInterface): Promise<DatabaseResult> {
        return this.executeBatch(database, { sql: "BEGIN TRANSACTION", params: [] });
    }

    private commitTransaction(database: WebSqlObjectInterface): Promise<DatabaseResult> {
        return this.executeBatch(database, { sql: "COMMIT", params: [] });
    }
}
