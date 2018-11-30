import * as sqlite3 from "sqlite3";
import { SQLite3DatabaseAdapter } from "../../adapters/sqlite3-database-adapter";

export class SQLiteDatabase {

    public init() {
        return new SQLite3DatabaseAdapter(sqlite3.Database).create({ name: ":memory:" });
    }
}