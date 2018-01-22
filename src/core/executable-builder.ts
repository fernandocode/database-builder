import { Database, DatabaseObject, DatabaseTransaction } from "./../definitions/database-definition";
import { QueryCompiled } from "./query-compiled";
import { ResultExecuteSql } from "./result-execute-sql";

export class ExecutableBuilder {

    constructor(public enableLog: boolean = true) {

    }

    public execute(
        compiled: QueryCompiled,
        database: Database,
    ): Promise<ResultExecuteSql> {
        this.log(compiled);
        return this.executeSql(database, compiled);
    }

    private executeSql(
        database: Database, compiled: QueryCompiled,
    ): Promise<ResultExecuteSql> {
        if ((database as DatabaseObject).addTransaction) {
            return (database as DatabaseObject).executeSql(
                compiled.query,
                compiled.params,
            );
        }
        return new Promise<any>((resolve, reject) => {
            (database as DatabaseTransaction).executeSql(
                compiled.query,
                compiled.params,
                (tx: DatabaseTransaction, result: ResultExecuteSql) => {
                    resolve(result);
                },
                (tx: DatabaseTransaction, error: any) => {
                    reject(error);
                },
            );
        });
    }

    private log(log: any) {
        if (this.enableLog) {
            // tslint:disable-next-line
            console.log(log);
        }
    }
}
