import { DatabaseBase, DatabaseObject, DatabaseResult } from "../definitions/database-definition";
import { QueryCompiled } from "./query-compiled";
import { ReplacementParam } from "./replacement-param";
import { Observable, Observer } from "rxjs";

export class ExecutableBuilder {

    constructor(public enableLog: boolean = true) {

    }

    public executeBatch(
        compiled: QueryCompiled[],
        database: DatabaseObject,
    ): Observable<DatabaseResult[]> {
        return Observable.create((observer: Observer<DatabaseResult[]>) => {
            database.sqlBatch(this.buildSqlBatch(compiled))
                .then(result => {
                    observer.next(result);
                    observer.complete();
                })
                .catch(err => observer.error(err));
        });
    }

    public execute(
        compiled: QueryCompiled[],
        database: DatabaseBase,
    ): Observable<DatabaseResult[]> {
        return Observable.create((observer: Observer<DatabaseResult[]>) => {
            this.executorLinked(compiled, [], database)
                .subscribe(result => {
                    observer.next(result);
                    observer.complete();
                }, err => {
                    observer.error(err);
                    observer.complete();
                });
        });
    }

    private buildSqlBatch(compiled: QueryCompiled[]): Array<(string | string[] | any)> {
        return compiled.map(x => {
            const r = x.params.length > 0
                ? [x.query, x.params]
                : x.query;
            this.log(r);
            return r;
        });
    }

    private executeSql(
        database: DatabaseBase, compiled: QueryCompiled,
    ): Observable<DatabaseResult> {
        return Observable.create((observer: Observer<DatabaseResult>) => {
            this.log(compiled);
            database.executeSql(
                compiled.query,
                compiled.params,
            )
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

    private checkParams(
        script: QueryCompiled,
        resultadosAnteriores: DatabaseResult[]
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
    ): Observable<DatabaseResult[]> {
        return Observable.create((observer: Observer<DatabaseResult[]>) => {
            if (compiled && compiled.length > 0) {
                this.executeSql(database, this.checkParams(compiled[0], dataResultsApplied))
                    .subscribe(result => {
                        // remove o item executado
                        compiled.shift();
                        this.executorLinked(compiled, dataResultsApplied.concat([result]), database)
                            .subscribe(res => {
                                observer.next([result].concat(res));
                                observer.complete();
                            }, (err: any) => {
                                observer.error(err);
                                observer.complete();
                            });
                    }, (err: any) => {
                        observer.error(err);
                        observer.complete();
                    });
            } else {
                observer.next([]);
                observer.complete();
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
