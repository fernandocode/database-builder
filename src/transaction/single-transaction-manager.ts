import { Observable, of, Subject } from "rxjs";
import { catchError, concatMap, tap, mergeMap } from "rxjs/operators";

/**
 * Manages transaction commits to execute sequentially
 * Because some providers have limitations in executing simultaneous transactions, such as: SQLite
 * Initial idea: https://stackblitz.com/edit/rxjs-single-transaction-manager
 */
export class SingleTransactionManager {

    private subject = new Subject<Observable<any>>();

    constructor() {
        this.subject
            .pipe(
                // mergeMap(obs =>
                concatMap(obs =>
                    obs.pipe(
                        // Não permitir propagação de erro interno, pois se o ocorrer um erro não tratado no subject ele irá parar de funcionar,
                        // causando erro em todas as tentativas de execuções futuras
                        catchError(err => of(err))
                    )
                )
            )
            .subscribe(_resultIgnored => {
            });
    }

    public commitOnStack(commit: Observable<boolean>): Observable<boolean> {
        return new Observable<boolean>(observer => {
            this.subject.next(
                commit.pipe(
                    tap(observer)
                )
            );
        });
    }
}