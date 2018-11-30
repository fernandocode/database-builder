import { DatabaseConfig } from "./database-config";

export interface SQLiteInterface {
    create(
        config: DatabaseConfig
    ): Promise<SQLiteObjectInterface>;
}
export interface SQLiteObjectInterface {
    transaction(
        fn: (tx: DbTransactionInterface) => void
    ): Promise<any>;
    executeSql(
        statement: string,
        params?: any[]
    ): Promise<any>;
}
export interface DbTransactionInterface {
    executeSql: (
        sql: any,
        values?: any[],
        success?: Function,
        error?: Function
    ) => void;
}