import { ManagedTransaction } from "../transaction/managed-transaction";

export type DatabaseBase = DatabaseTransaction | DatabaseObject | DatabaseBaseTransaction;

export interface DatabaseBaseTransaction {
    executeSql(
        sql: string,
        values: any
    ): Promise<DatabaseResult>;
}

// tslint:disable-next-line:no-empty-interface
export interface DatabaseTransaction extends DatabaseBaseTransaction {
}

export interface DatabaseObject {
    /**
     * @param fn {any}
     * @returns {Promise<any>}
     */
    transaction(fn: (transaction: DatabaseBaseTransaction) => void): Promise<any>;
    // /**
    //  * @param fn {() => void}
    //  * @returns {Promise<any>}
    //  */
    // readTransaction(fn: (transaction: DatabaseBaseTransaction) => void): Promise<any>;
    // startNextTransaction(): void;
    /**
     * Execute SQL on the opened database. Note, you must call `create` first, and
     * ensure it resolved and successfully opened the database.
     */
    executeSql(statement: string, params: any): Promise<DatabaseResult>;

    /**
     * @param sqlStatements {string[] | string[][] | any[]}
     * @returns {Promise<any>}
     */
    sqlBatch(sqlStatements: Array<(string | string[] | any)>): Promise<any>;

    managedTransaction(): ManagedTransaction;
}

export interface DatabaseResult {
    rows: DatabaseRowList;
    rowsAffected: number;
    insertId: any;
}

export interface DatabaseRowList {
    length: number;
    item(index: number): any;
}
