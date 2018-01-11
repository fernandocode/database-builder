
export type Database = DatabaseTransaction | DatabaseObject;

export interface DatabaseTransaction {
    start: () => void;
    executeSql: (sql: any, values: any, success: Function, error: Function) => void;
    addStatement: (sql: any, values: any, success: Function, error: Function) => void;
    handleStatementSuccess: (handler: Function, response: any) => void;
    handleStatementFailure: (handler: Function, response: any) => void;
    run: () => void;
    abort: (txFailure: any) => void;
    finish: () => void;
    abortFromQ: (sqlerror: any) => void;
}

export interface DatabaseObject {
    addTransaction(transaction: (tx: DatabaseTransaction) => void): void;
    /**
     * @param fn {any}
     * @returns {Promise<any>}
     */
    transaction(fn: any): Promise<any>;
    /**
     * @param fn {Function}
     * @returns {Promise<any>}
     */
    readTransaction(fn: (tx: DatabaseTransaction) => void): Promise<any>;
    startNextTransaction(): void;
    /**
     * Execute SQL on the opened database. Note, you must call `create` first, and
     * ensure it resolved and successfully opened the database.
     */
    executeSql(statement: string, params: any): Promise<any>;
    /**
     * @param sqlStatements {Array<string | string[] | any>}
     * @returns {Promise<any>}
     */
    sqlBatch(sqlStatements: Array<string | string[] | any>): Promise<any>;
    abortallPendingTransactions(): void;
}