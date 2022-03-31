import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseBaseTransaction, DatabaseResult } from "../definitions/database-definition";
import { BaseDatabaseAdapter } from "./base-database.adapter";
import { WebSqlTransactionInterface } from "../definitions/websql-interface";

export abstract class DatabaseAbstractSQLiteService extends BaseDatabaseAdapter<DatabaseSQLiteObject> {

  protected abstract sqliteCreate(config: DatabaseConfig)
    : Promise<DatabaseSQLiteObject>;

  protected createDatabaseNative(
    config: DatabaseConfig
  ): Promise<DatabaseSQLiteObject> {
    return this.sqliteCreate(config);
  }

  protected convertToExecuteSql(
    databaseNative: DatabaseSQLiteObject
  ): (sql: string, values: any) => Promise<DatabaseResult> {
    return (statement: string, params: any): Promise<DatabaseResult> => {
      return databaseNative.executeSql(statement, params);
    };
  }

  protected convertToTransaction(
    databaseNative: DatabaseSQLiteObject
  ): (fn: (transaction: WebSqlTransactionInterface) => void) => Promise<any> {
    return (fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> => {
      return databaseNative.transaction(transaction => {
        fn({
          executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
            return new Promise<DatabaseResult>((executeSqlResolve, executeSqlReject) => {
              transaction.executeSql(sql, Array.isArray(values) ? values : [],
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
    };
  }

  protected convertToSqlBatch(
    databaseNative: DatabaseSQLiteObject
  ): (sqlStatements: any[]) => Promise<DatabaseResult[]> {
    return (sqlStatements: Array<(string | string[] | any)>): Promise<DatabaseResult[]> => {
      return databaseNative.sqlBatch(sqlStatements);
    };
  }

  protected async getSQLiteVersion(databaseNative: DatabaseSQLiteObject): Promise<string> {
    const result = await databaseNative.executeSql("select sqlite_version()", []);
    return result.rows.item(0);
  }

  protected getLimitVariables(_databaseNative: DatabaseSQLiteObject): Promise<number> {
    return Promise.resolve(10000);
  }

  // public create(config: DatabaseConfig): Promise<DatabaseObject> {
  //   return new Promise<DatabaseObject>((resolve, reject) => {
  //     return this.sqliteCreate(config)
  //       .then((databaseNative: DatabaseSQLiteObject) => {
  //         resolve(
  //           this.injectManagedTransactionInDatabase(
  //             {
  //               executeSql: (statement: string, params: any): Promise<DatabaseResult> => {
  //                 return databaseNative.executeSql(statement, params);
  //               },
  //               transaction: (fn: (transaction: DatabaseBaseTransaction) => void): Promise<any> => {
  //                 return databaseNative.transaction(transiction => {
  //                   fn({
  //                     executeSql: (sql: string, values: any): Promise<DatabaseResult> => {
  //                       return new Promise<DatabaseResult>((executeSqlResolve, executeSqlReject) => {
  //                         transiction.executeSql(sql, Array.isArray(values) ? values : [],
  //                           (_s: any, r: DatabaseResult | PromiseLike<DatabaseResult>) => {
  //                             executeSqlResolve(r);
  //                           },
  //                           (_r: any, err: any) => {
  //                             executeSqlReject(err);
  //                           });
  //                       });
  //                     }
  //                   });
  //                 });
  //               },
  //               sqlBatch: (sqlStatements: Array<(string | string[] | any)>): Promise<DatabaseResult[]> => {
  //                 return databaseNative.sqlBatch(sqlStatements);
  //               }
  //             } as DatabaseObject)
  //         );
  //       })
  //       .catch(err => reject(err));
  //   });
  // }
}

/**
 * @hidden
 */
export interface DatabaseSQLiteObject {
  transaction(fn: (transaction: DatabaseSQLiteTransaction) => void): Promise<any>;
  executeSql(statement: string, params: any): Promise<DatabaseResult>;
  /**
   * @param sqlStatements {string[] | string[][] | any[]}
   * @returns {Promise<any>}
   */
  sqlBatch(sqlStatements: Array<(string | string[] | any)>): Promise<any>;
}

/**
 * @hidden
 */
export interface DatabaseSQLiteTransaction {
  executeSql: (sql: any, values?: any[], success?: Function, error?: Function) => void;
}