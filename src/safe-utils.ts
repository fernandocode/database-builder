import { forkJoin, Observable, ObservableInput, of } from "rxjs";

export function forkJoinSafe<T>(array: Array<ObservableInput<T>>): Observable<T[]> {
    if (!array.length) {
        return of([]);
    }
    return forkJoin(array);
}