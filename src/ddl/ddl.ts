import { ExpressionOrColumn, Utils } from "./../core/utils";
import { Drop } from "./drop/drop";
import { Create } from "./create/create";
import { Alter } from "./alter/alter";
import { DatabaseBase } from "../definitions/database-definition";
import { GetMapper } from "../mapper/interface-get-mapper";
import { MapperTable } from "../mapper-table";

export class Ddl {

    public readonly enableLog: boolean;
    private readonly _database: DatabaseBase;
    private readonly _getMapper: GetMapper;

    constructor(
        {
            getMapper,
            database = void 0,
            enableLog = true
        }: {
            getMapper?: GetMapper,
            database?: DatabaseBase,
            enableLog?: boolean
        } = {}
        // private readonly _database: DatabaseBase = void 0,
        // private readonly _mappersTable: GetMapper,
        // public readonly enableLog: boolean = true
    ) {
        this._getMapper = getMapper;
        this._database = database;
        this.enableLog = enableLog;
    }

    public create<T>(
        typeT: new () => T,
        mapperTable: MapperTable = this._getMapper.get(typeT).mapperTable,
        database: DatabaseBase = this.getDatabase()
    ): Create<T> {
        return new Create(typeT, mapperTable, database, this.enableLog);
    }

    public alter<T>(
        typeT: new () => T,
        mapperTable: MapperTable = this._getMapper.get(typeT).mapperTable,
        database: DatabaseBase = this.getDatabase()
    ): Alter<T> {
        return new Alter(typeT, mapperTable, database, this.enableLog);
    }

    public drop<T>(
        typeT: new () => T,
        mapperTable: MapperTable = this._getMapper.get(typeT).mapperTable,
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
                `, [this._getMapper.get(tablename).tableName])
                .then(result => {
                    resolve(result.rows.length > 0);
                })
                .catch(err => reject(err));
        });
    }

    /**
     * hasColumn
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
                `, [this._getMapper.get(tablename).tableName, Utils.getColumn(column)])
                .then(result => {
                    resolve(result.rows.length > 0);
                })
                .catch(err => reject(err));
        });
    }

    private getDatabase() {
        // if (!this._database) {
        //     throw new DatabaseBuilderError("Transaction ou Database not specified in query.");
        // }
        return this._database;
    }
}
