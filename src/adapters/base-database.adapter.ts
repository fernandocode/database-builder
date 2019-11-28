import { DatabaseObject } from "../definitions/database-definition";
import { ManagedTransaction } from "../transaction/managed-transaction";

export abstract class BaseDatabaseAdapter {

    protected injectManagedTransactionInDatabase(databaseObject: DatabaseObject) {
        databaseObject.managedTransaction = () => {
            return new ManagedTransaction(databaseObject);
        };
        return databaseObject;
    }

}