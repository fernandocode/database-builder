import { DatabaseObject, DatabaseResult } from "../definitions/database-definition";
import { ManagedTransaction } from "../transaction/managed-transaction";
import { DatabaseCreatorContract } from "../definitions/database-creator-contract";
import { DatabaseConfig } from "../definitions/database-config";
import { WebSqlTransactionInterface } from "../definitions/websql-interface";
import { SingleTransactionManager } from "../transaction/single-transaction-manager";

export abstract class BaseDatabaseAdapter<DatabaseNativeInterface> implements DatabaseCreatorContract {

    private _singleTransactionManager: SingleTransactionManager;

    constructor() {
        this._singleTransactionManager = new SingleTransactionManager();
    }

    public async create(
        config: DatabaseConfig
    ): Promise<DatabaseObject> {
        const databaseNative: DatabaseNativeInterface = await this.createDatabaseNative(config);
        return this.convertDatabaseNativeToDatabaseObject(databaseNative, enableLog);
    }

    protected abstract createDatabaseNative(
        config: DatabaseConfig
    ): Promise<DatabaseNativeInterface>;

    protected abstract convertToExecuteSql(
        databaseNative: DatabaseNativeInterface
    ): (sql: string, values: any) => Promise<DatabaseResult>;

    protected abstract convertToTransaction(
        databaseNative: DatabaseNativeInterface
    ): (fn: (transaction: WebSqlTransactionInterface) => void) => Promise<any>;

    protected abstract convertToSqlBatch(
        databaseNative: DatabaseNativeInterface
    ): (sqlStatements: Array<(string | string[] | any)>) => Promise<DatabaseResult[]>;

    protected convertDatabaseNativeToDatabaseObject(
        databaseNative: DatabaseNativeInterface,
        enableLog: boolean
    ): DatabaseObject {
        const databaseObject = {
            executeSql: this.convertToExecuteSql(databaseNative),
            transaction: this.convertToTransaction(databaseNative),
            sqlBatch: this.convertToSqlBatch(databaseNative)
        } as DatabaseObject;
        return this.injectManagedTransactionInDatabase(databaseObject, enableLog);
    }

    protected injectManagedTransactionInDatabase(databaseObject: DatabaseObject, enableLog: boolean) {
        databaseObject.managedTransaction = () => {
            return new ManagedTransaction(databaseObject, this._singleTransactionManager, enableLog);
        };
        return databaseObject;
    }

}