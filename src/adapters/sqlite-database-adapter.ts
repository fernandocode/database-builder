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

    private _sqliteLimitVariablesCached: number;

    protected async getLimitVariables(databaseNative: DatabaseSQLiteObject): Promise<number> {
        if (this._sqliteLimitVariablesCached)
            return this._sqliteLimitVariablesCached;
        const version = await this.getSQLiteVersion(databaseNative);
        const versionBreakChange = 3.32;
        const versionNumber = +/\d+\.\d+/.exec(version)[0];

        // https://www.sqlite.org/limits.html#max_variable_number
        if (versionNumber < versionBreakChange) {
            return this._sqliteLimitVariablesCached = 999;
        }
        return this._sqliteLimitVariablesCached = 32766;
    }
}