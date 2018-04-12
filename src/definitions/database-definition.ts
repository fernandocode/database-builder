
export type DatabaseBase = DatabaseTransaction | DatabaseObject;

export interface DatabaseTransaction {
    start: () => void;
    executeSql: (
        sql: any,
        values: any,
        success: (tx: DatabaseTransaction, result: DatabaseResult) => void,
        error: (tx: DatabaseTransaction, error: any) => void,
    ) => void;
    addStatement: (sql: any, values: any, success: () => void, error: () => void) => void;
    handleStatementSuccess: (handler: () => void, response: any) => void;
    handleStatementFailure: (handler: () => void, response: any) => void;
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
     * @param fn {() => void}
     * @returns {Promise<any>}
     */
    readTransaction(fn: (tx: DatabaseTransaction) => void): Promise<any>;
    startNextTransaction(): void;
    /**
     * Execute SQL on the opened database. Note, you must call `create` first, and
     * ensure it resolved and successfully opened the database.
     */
    executeSql(statement: string, params: any): Promise<DatabaseResult>;
    /**
     * @param sqlStatements {Array<string | string[] | any>}
     * @returns {Promise<any>}
     */
    sqlBatch(sqlStatements: Array<string | string[] | any>): Promise<any>;
    abortallPendingTransactions(): void;
}

export interface DatabaseResult {
    rows: DatabaseRowList;
    rowsAffected: number;
    insertId: number;
}

export interface DatabaseRowList {
    length: number;
    item(index: number): any;
}
