import { Database, DatabaseObject, DatabaseTransaction } from './../definitions/database-definition';
import { ResultExecuteSql, QueryCompiled } from "./utils";

export class ExecutableBuilder {

    constructor(public enableLog: boolean = true){

    }

    public execute(
        compiled: QueryCompiled,
        database: Database
    ): Promise<ResultExecuteSql> {
        this.log(compiled);
        return this.executeSql(database, compiled);
    }

    private executeSql(
        database: Database, compiled: QueryCompiled
    ): Promise<ResultExecuteSql> {
        if ((<DatabaseObject>database).addTransaction) {
        // if (database instanceof SQLiteObject) {
            return (<DatabaseObject>database).executeSql(
                compiled.query,
                compiled.params
            );
        }
        return new Promise<any>((resolve, reject) => {
            (<DatabaseTransaction>database).executeSql(
                compiled.query,
                compiled.params,
                (tx: DatabaseTransaction, result: ResultExecuteSql) => {
                    resolve(result);
                },
                (tx: DatabaseTransaction, error: any) => {
                    reject(error);
                }
            );
        });
    }

    private log(log: any) {
        if (this.enableLog)
            console.log(log);
    }
}