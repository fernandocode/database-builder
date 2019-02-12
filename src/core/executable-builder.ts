import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { QueryCompiled } from "./query-compiled";
import { ReplacementParam } from "./replacement-param";
import { Observable, Observer } from "rxjs";

export class ExecutableBuilder {

    constructor(public enableLog: boolean = true) {

    }

    public executeObserver(
        compiled: QueryCompiled[],
        database: DatabaseBase,
    ): Observable<DatabaseResult[]> {
        return Observable.create((observer: Observer<DatabaseResult[]>) => {
            this.executorLinked(compiled, [], database)
                .then(result => {
                    observer.next(result);
                    observer.complete();
                })
                .catch(err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    public execute(
        compiled: QueryCompiled[],
        database: DatabaseBase,
    ): Promise<DatabaseResult[]> {
        return this.executorLinked(compiled, [], database);
    }

    private executeSql(
        database: DatabaseBase, compiled: QueryCompiled,
    ): Promise<DatabaseResult> {
        this.log(compiled);
        return database.executeSql(
            compiled.query,
            compiled.params,
        );
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
