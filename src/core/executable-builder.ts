import { DatabaseBaseTransaction } from './../definitions/database-definition';
import { DatabaseBase, DatabaseObject, DatabaseResult, DatabaseTransaction } from "../definitions/database-definition";
import { QueryCompiled } from "./query-compiled";

export class ExecutableBuilder {

    constructor(public enableLog: boolean = true) {

    }

    public execute(
        compiled: QueryCompiled,
        database: DatabaseBase,
    ): Promise<DatabaseResult> {
        this.log(compiled);
        return this.executeSql(database, compiled);
    }

    private executeSql(
        database: DatabaseBase, compiled: QueryCompiled,
    ): Promise<DatabaseResult> {
        if ((database as DatabaseObject).addTransaction) {
            return (database as DatabaseObject).executeSql(
                compiled.query,
                compiled.params,
            );
        }
        return new Promise<any>((resolve, reject) => {
            (database as DatabaseBaseTransaction).executeSql(
                compiled.query,
                compiled.params,
                (tx: DatabaseBaseTransaction, result: DatabaseResult) => {
                    resolve(result);
                },
                (tx: DatabaseBaseTransaction, error: any) => {
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
