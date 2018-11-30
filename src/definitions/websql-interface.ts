export interface WebSqlInterface {
    openDatabase(
        name: string,
        version: string,
        description: string,
        size: number
    ): WebSqlObjectInterface;
}
export interface WebSqlObjectInterface {
    transaction(
        fn: (tx: WebSqlTransactionInterface) => void
    ): Promise<any>;
}
export interface WebSqlTransactionInterface {
    executeSql: (
        sql: any,
        values?: any[],
        success?: Function,
        error?: Function
    ) => void;
}