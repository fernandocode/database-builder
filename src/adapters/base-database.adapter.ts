import { DatabaseObject, DatabaseResult } from "../definitions/database-definition";
import { ManagedTransaction } from "../transaction/managed-transaction";
import { DatabaseCreatorContract } from "../definitions/database-creator-contract";
import { DatabaseConfig } from "../definitions/database-config";
import { WebSqlTransactionInterface } from "../definitions/websql-interface";

export abstract class BaseDatabaseAdapter<DatabaseNativeInterface> implements DatabaseCreatorContract {

    public async create(
        config: DatabaseConfig
    ): Promise<DatabaseObject> {
        const databaseNative: DatabaseNativeInterface = await this.createDatabaseNative(config);
        return this.convertDatabaseNativeToDatabaseObject(databaseNative);
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
        databaseNative: DatabaseNativeInterface
    ): DatabaseObject {
        const databaseObject = {
            executeSql: this.convertToExecuteSql(databaseNative),
            transaction: this.convertToTransaction(databaseNative),
            sqlBatch: this.convertToSqlBatch(databaseNative)
        } as DatabaseObject;
        return this.injectManagedTransactionInDatabase(databaseObject);
    }

    protected injectManagedTransactionInDatabase(databaseObject: DatabaseObject) {
        databaseObject.managedTransaction = () => {
            return new ManagedTransaction(databaseObject);
        };
        return databaseObject;
    }

}