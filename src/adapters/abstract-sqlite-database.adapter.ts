import { DatabaseCreatorContract } from "../definitions/database-creator-contract";
import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseBaseTransaction, DatabaseObject, DatabaseResult } from "../definitions/database-definition";

export abstract class DatabaseAbstractSQLiteService implements DatabaseCreatorContract {

  protected abstract sqliteCreate(config: DatabaseConfig): Promise<DatabaseSQLiteObject>;

  public create(config: DatabaseConfig): Promise<DatabaseObject> {
    return new Promise<DatabaseObject>((resolve, reject) => {
      return this.sqliteCreate(config)
        .then(database => {
          resolve({
            executeSql: (statement: string, params: any): Promise<DatabaseResult> => {
              return database.executeSql(statement, params);
            },
            transaction: (fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> => {
              return database.transaction(transiction => {
                fn({
                  executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
                    return new Promise<DatabaseResult>((executeSqlResolve, executeSqlReject) => {
                      transiction.executeSql(sql, Array.isArray(values) ? values : [],
                        (_s: any, r: DatabaseResult | PromiseLike<DatabaseResult>) => {
                          executeSqlResolve(r);
                        },
                        (_r: any, err: any) => {
                          executeSqlReject(err);
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

/**
 * @hidden
 */
export interface DatabaseSQLiteObject {
  transaction(fn: (transaction: DatabaseSQLiteTransaction) => void): Promise<any>;
  executeSql(statement: string, params: any): Promise<DatabaseResult>;
}

/**
 * @hidden
 */
export interface DatabaseSQLiteTransaction {
  executeSql: (sql: any, values?: any[], success?: Function, error?: Function) => void;
}