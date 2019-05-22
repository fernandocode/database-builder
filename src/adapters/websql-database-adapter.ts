import { DatabaseCreatorContract } from "../definitions/database-creator-contract";
import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseObject, DatabaseResult } from "../definitions/database-definition";
import { WebSqlInterface, WebSqlTransactionInterface } from "../definitions/websql-interface";

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
export class WebSqlDatabaseAdapter implements DatabaseCreatorContract {

    constructor(private _creator: WebSqlInterface) {

    }

    public create(config: DatabaseConfig): Promise<DatabaseObject> {
        return new Promise<DatabaseObject>((resolve, reject) => {
            // o método OpenDatabase precisa de 4 parametros; o nome do banco de dados, a versão, a descrição e o tamanho estimado (em bytes)
            const database = this._creator.openDatabase(config.name, "1.0", config.name, 200000);

            // de qualquer forma, sempre teste que o objeto foi instanciado direito antes de usá-lo
            if (!database) {
                reject("Não foi possivel iniciar o banco de dados no Browser!");
            }
            resolve({
                executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                    return new Promise<DatabaseResult>((executeSqlResolve, executeSqlReject) => {
                        if (
                            sql.toUpperCase().indexOf("TRANSACTION") > -1
                            ||
                            sql.toUpperCase().indexOf("COMMIT") > -1
                            ||
                            sql.toUpperCase().indexOf("ROLLBACK") > -1
                        ) {
                            this.ignoreExecuteSql(sql, values);
                            // // tslint:disable-next-line:no-console
                            // console.warn(`command sql ignored: '${sql}'`);
                            // executeSqlResolve({} as DatabaseResult);
                        } else {
                            database.transaction(transaction => {
                                return this.executeSql(transaction, sql, values);
                                // transaction.executeSql(
                                //     sql,
                                //     Array.isArray(values) ? values : [],
                                //     (t: WebSqlTransactionInterface, r: any) => executeSqlResolve(r),
                                //     (t: WebSqlTransactionInterface, err: any) => executeSqlReject(err)
                                // );
                            });
                        }
                    });
                },
                transaction:
                    (fn: (transaction: WebSqlTransactionInterface) => void): Promise<any> => {
                        return database.transaction(transaction => {
                            fn({
                                executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                                    return this.executeSql(transaction, sql, values);
                                    // return new Promise<DatabaseResult>((resolve, reject) => {
                                    //     transaction.executeSql(
                                    //         sql,
                                    //         Array.isArray(values) ? values : [],
                                    //         (t: WebSqlTransactionInterface, r: any) => resolve(r),
                                    //         (t: WebSqlTransactionInterface, err: any) => reject(err)
                                    //     );
                                    // });
                                }
                            });
                        });
                    }
            } as DatabaseObject);
        });
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
}
