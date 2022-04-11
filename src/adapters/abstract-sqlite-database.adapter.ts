import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseBaseTransaction, DatabaseResult } from "../definitions/database-definition";
import { BaseDatabaseAdapter } from "./base-database.adapter";
import { WebSqlTransactionInterface } from "../definitions/websql-interface";
import { SQLiteObjectInterface } from "../definitions";

export abstract class DatabaseAbstractSQLiteService extends BaseDatabaseAdapter<SQLiteObjectInterface> {

  protected abstract sqliteCreate(config: DatabaseConfig)
    : Promise<SQLiteObjectInterface>;

  protected createDatabaseNative(
    config: DatabaseConfig
  ): Promise<SQLiteObjectInterface> {
    return this.sqliteCreate(config);
  }

  protected convertToExecuteSql(
    databaseNative: SQLiteObjectInterface
  ): (sql: string, values: any) => Promise<DatabaseResult> {
    return (statement: string, params: any): Promise<DatabaseResult> => {
      return databaseNative.executeSql(statement, params);
    };
  }

  protected convertToTransaction(
    databaseNative: SQLiteObjectInterface
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
    databaseNative: SQLiteObjectInterface
  ): (sqlStatements: any[]) => Promise<DatabaseResult[]> {
    return (sqlStatements: Array<(string | string[] | any)>): Promise<DatabaseResult[]> => {
      return databaseNative.sqlBatch(sqlStatements);
    };
  }
}