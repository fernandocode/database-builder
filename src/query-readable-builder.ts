import { QueryBuilder } from "./query-builder";
import { MetadataTable } from "./metadata-table";
import { QueryReadableBuilderBase } from './query-readable-builder-base';
import { Database } from "./definitions/database-definition";

export class QueryReadableBuilder<T> extends QueryReadableBuilderBase{

    constructor(
        typeT: new () => T,
        enableLog: boolean = true
    ) {
        super(enableLog);
    }

    public executeAndRead(
        queryBuilder: QueryBuilder<T>,
        metadata: MetadataTable<T>,
        database: Database
    ): Promise<T[]> {
        return new Promise((resolve, reject) => {
            queryBuilder.execute(database)
                .then(cursor => {
                    this.log(cursor);
                    try {
                        resolve(this.read(cursor, metadata.newable, metadata.mapperTable));
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch(reject);
        });
    }
}