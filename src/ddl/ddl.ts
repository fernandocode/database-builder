import { Utils, ExpressionOrColumn } from './../core/utils';
import { Drop } from "./drop/drop";
import { Create } from "./create/create";
import { Alter } from "./alter/alter";
import { DatabaseBase } from "../definitions/database-definition";
import { DatabaseBuilderError } from "../core/errors";
import { GetMapper } from "../mapper/interface-get-mapper";
import { MapperTable } from "../mapper-table";

export class Ddl {

    constructor(
        private _database: DatabaseBase = void 0,
        private _mappersTable: GetMapper,
        public enableLog: boolean = true) {
    }

    public create<T>(
        typeT: new () => T,
        mapperTable: MapperTable = this._mappersTable.get(typeT).mapperTable,
        database: DatabaseBase = this.getDatabase()
    ): Create<T> {
        return new Create(typeT, mapperTable, database, this.enableLog);
    }

    public alter<T>(
        typeT: new () => T,
        database: DatabaseBase = this.getDatabase()
    ): Alter<T> {
        return new Alter(typeT, database, this.enableLog);
    }

    public drop<T>(
        typeT: new () => T,
        mapperTable: MapperTable = this._mappersTable.get(typeT).mapperTable,
        database: DatabaseBase = this.getDatabase()
    ): Drop<T> {
        return new Drop(typeT, mapperTable, database, this.enableLog);
    }

    /**
     * hasTable
     */
    public hasTable<T>(
        tablename: (new () => T) | string
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._database.executeSql(`
                SELECT name
                    FROM sqlite_master
                WHERE type = 'table' AND 
                        name = ?;
                `, [Utils.databaseName(tablename)])
                .then(result => {
                    resolve(result.rows.length > 0);
                })
                .catch(err => reject(err));
        });
    }

    /**
     * hasTable
     */
    public hasColumn<T>(
        tablename: (new () => T) | string,
        column: ExpressionOrColumn<any, T>
    ): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this._database.executeSql(`
                SELECT name
                    FROM pragma_table_info(?)
                WHERE name = ?;          
                `, [Utils.databaseName(tablename), Utils.getColumn(column)])
                .then(result => {
                    resolve(result.rows.length > 0);
                })
                .catch(err => reject(err));
        });
    }

    private getDatabase() {
        if (!this._database) {
            throw new DatabaseBuilderError("Transaction ou Database not specified in query.");
        }
        return this._database;
    }
}
