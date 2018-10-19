import { DatabaseBaseTransaction } from "./../definitions/database-definition";
import { DatabaseBase, DatabaseObject, DatabaseResult, DatabaseTransaction } from "../definitions/database-definition";
import { QueryCompiled } from "./query-compiled";
import { ReplacementParam } from "./replacement-param";

export class ExecutableBuilder {

    constructor(public enableLog: boolean = true) {

    }

    public execute(
        compiled: QueryCompiled[],
        database: DatabaseBase,
    ): Promise<DatabaseResult[]> {
        // this.log(compiled);
        return this.executorLinked(compiled, [], database);
        // return this.executeSql(database, compiled);
    }

    private executeSql(
        database: DatabaseBase, compiled: QueryCompiled,
    ): Promise<DatabaseResult> {
        this.log(compiled);
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

    private checkParams(
        script: QueryCompiled, resultadosAnteriores: DatabaseResult[]
    ): QueryCompiled {
        const paramsResult: any[] = [];
        script.params.forEach(param => {
            if (param instanceof ReplacementParam) {
                let value = resultadosAnteriores as any;
                param.properties.forEach(property => {
                    value = value[property];
                });
                paramsResult.push(value);
            } else {
                paramsResult.push(param);
            }
        });
        script.params = paramsResult;
        return script;
    }

    private executorLinked(
        compiled: QueryCompiled[],
        dataResultsApplied: DatabaseResult[],
        database: DatabaseBase
    ): Promise<DatabaseResult[]> {
        return new Promise((resolve, reject) => {
            if (compiled && compiled.length > 0) {
                this.executeSql(database, this.checkParams(compiled[0], dataResultsApplied))
                    .then(result => {
                        // remove o item executado
                        compiled.shift();
                        this.executorLinked(compiled, dataResultsApplied.concat([result]), database)
                            .then(res => {
                                resolve([result].concat(res));
                            })
                            .catch((err: any) => reject(err));
                    })
                    .catch((err: any) => reject(err));
            } else {
                resolve([]);
            }
        });
    }

    private log(log: any) {
        if (this.enableLog) {
            // tslint:disable-next-line
            console.log(log);
        }
    }
}
