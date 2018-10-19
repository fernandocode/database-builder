import { DatabaseBase, DatabaseResult } from "../definitions/database-definition";

export interface SqlExecutable {
    execute(cascade?: boolean, database?: DatabaseBase): Promise<DatabaseResult[]>;
}