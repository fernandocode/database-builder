import { Observable } from "rxjs";

export function forkJoinSafe<T = any>(array: Observable<T>[]): Observable<T[]> {
    if (!array.length) {
        return Observable.of([])
    }
    return Observable.forkJoin<T>(array);
}