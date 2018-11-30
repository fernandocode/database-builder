export interface DatabaseConfig {
    /**
     * Name of the database. Example: 'my.db'
     */
    name: string;
    /**
     * Location of the database. Example: 'default'
     */
    location?: string;
    /**
     * iOS Database Location. Example: 'Library'
     */
    iosDatabaseLocation?: string;
    /**
     * support opening pre-filled databases with https://github.com/litehelpers/cordova-sqlite-ext
     */
    createFromLocation?: number;
    /**
     * support encrypted databases with https://github.com/litehelpers/Cordova-sqlcipher-adapter
     */
    key?: string;
}
