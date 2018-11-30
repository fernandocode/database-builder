import { DatabaseCreatorContract } from "../definitions/database-creator-contract";
import { SQLiteInterface } from "../definitions/sqlite-interface";
import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseBaseTransaction, DatabaseObject, DatabaseResult } from "../definitions/database-definition";
import { WebSqlTransactionInterface } from "../definitions/websql-interface";

/**
 * Adapter for https://ionicframework.com/docs/native/sqlite/
 *
 * Example usage:
 *
 * `new SQLiteDatabaseAdapter(sqlite);`
 *
 * PS: 'sqlite' is instance SQLite
 *
 * @export
 * @class SQLiteDatabaseAdapter
 * @implements {DatabaseCreatorContract}
 */
export class SQLiteDatabaseAdapter implements DatabaseCreatorContract {

    constructor(private _sqlite: SQLiteInterface) {

    }

    public create(config: DatabaseConfig): Promise<DatabaseObject> {
        return new Promise<DatabaseObject>((resolve, reject) => {
            return this._sqlite.create(config)
                .then(database => {
                    resolve({
                        executeSql: (statement: string, params: any): Promise<DatabaseResult> => {
                            return database.executeSql(statement, params);
                        },
                        transaction: (fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> => {
                            return database.transaction(transiction => {
                                fn({
                                    executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                                        return new Promise<DatabaseResult>((resolve, reject) => {
                                            transiction.executeSql(sql, Array.isArray(values) ? values : [],
                                                (t: WebSqlTransactionInterface, r: any) => {
                                                    resolve(r);
                                                },
                                                (t: WebSqlTransactionInterface, err: any) => {
                                                    reject(err);
                                                });
                                        });
                                    }
                                });
                            });
                        }
                    } as DatabaseObject);
                })
                .catch(err => reject(err));
        });
    }
}
