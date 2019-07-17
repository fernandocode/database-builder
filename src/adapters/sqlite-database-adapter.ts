import { SQLiteInterface } from "../definitions/sqlite-interface";
import { DatabaseConfig } from "../definitions/database-config";
import { DatabaseAbstractSQLiteService, DatabaseSQLiteObject } from "./abstract-sqlite-database.adapter";

/**
 * Adapter for https://ionicframework.com/docs/native/sqlite/
 *
 * Example usage:
 *
 * `new SQLiteDatabaseAdapter(sqlite);`
 *
 * PS: 'sqlite' is instance SQLite
 *
 * @export
 * @class SQLiteDatabaseAdapter
 * @implements {DatabaseCreatorContract}
 */
export class SQLiteDatabaseAdapter extends DatabaseAbstractSQLiteService {

    constructor(private _sqlite: SQLiteInterface) {
        super();

    }

    protected sqliteCreate(config: DatabaseConfig): Promise<DatabaseSQLiteObject> {
        return this._sqlite.create(config);
    }
}