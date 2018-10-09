import { DatabaseBase } from "../../definitions/database-definition";
import { MetadataTable } from "../../metadata-table";
import { QueryBuilder } from "./query-builder";
import { QueryReadableBuilderBase } from "./query-readable-builder-base";
import { DatabaseBuilderError } from "../../core/errors";

export class QueryReadableBuilder<T> extends QueryReadableBuilderBase {

    constructor(
        typeT: new () => T,
        enableLog: boolean = true,
    ) {
        super(enableLog);
    }

    public executeAndRead(
        queryBuilder: QueryBuilder<T>,
        metadata: MetadataTable<T>,
        database: DatabaseBase,
    ): Promise<T[]> {
        return new Promise((resolve, reject) => {
            queryBuilder.execute(database)
                .then((cursors) => {
                    this.log(cursors);
                    try {
                        if (cursors.length !== 1) {
                            throw new DatabaseBuilderError(`"toCast" is not ready to solve multiple queries in one batch!`);
                        }
                        resolve(this.read(cursors[0], metadata.newable, metadata.mapperTable));
                    } catch (error) {
                        reject(error);
                    }
                })
                .catch(reject);
        });
    }
}
