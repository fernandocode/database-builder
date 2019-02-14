import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";
import { Observable } from "rxjs";

export interface SqlExecutable {
    execute(cascade?: boolean, database?: DatabaseBase): Observable<DatabaseResult[]>;
}