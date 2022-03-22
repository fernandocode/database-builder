import { DatabaseBuilderError, QueryCompiled } from "../core";
import { Utils, ValueType } from "../core/utils";
import { MapperColumn } from "../mapper-column";
import { MapperTable } from "../mapper-table";

export class CommanderBuilder {

    public static delete(tableName: string)
        : QueryCompiled {
        return {
            params: [],
            query: `DELETE FROM ${tableName}`,
        };
    }

    public static deleteMapper<T>(mapper: MapperTable)
        : QueryCompiled {
        return this.delete(mapper.tableName);
    }

    public static update(tableName: string, columnsNames: string[], params: ValueType[])
        : QueryCompiled {
        return {
            params: [].concat(params),
            query: `UPDATE ${tableName} SET ${columnsNames.join(", ")}`,
        };
    }

    public static updateColumn<T>(tableName: string, columns: MapperColumn[], model: T)
        : QueryCompiled {
        return this.update(tableName, columns.map(x => x.column), columns.map(column => Utils.getValue<any, any>(model, column.fieldReference)?.[0]));
    }

    public static updateMapper<T>(mapper: MapperTable, model: T)
        : QueryCompiled {
        return this.updateColumn(mapper.tableName, mapper.columns, model);
    }

    public static insert(tableName: string, columnsNames: string[], params: ValueType[])
        : QueryCompiled {
        return this.batchInsert(tableName, columnsNames, [params])[0];
    }

    public static insertColumn<T>(tableName: string, columns: MapperColumn[], model: T)
        : QueryCompiled {
        return this.batchInsertColumn(tableName, columns, [model])[0];
    }

    public static insertMapper<T>(mapper: MapperTable, model: T)
        : QueryCompiled {
        return this.batchInsertMapper(mapper, [model])[0];
    }

    private static LIMIT_VARIABLES_INSERT = 10000;

    public static batchInsert(tableName: string, columnsNames: string[], values: Array<ValueType[]>)
        : QueryCompiled[] {
        if (this.validValues(values)) {
            return this.splitChunks(values, this.LIMIT_VARIABLES_INSERT).map(valuesChunk => {
                return {
                    params: [].concat(...valuesChunk),
                    query: Utils.normalizeSqlString(
                        `INSERT INTO ${tableName}
                    (${columnsNames.join(", ")})
                    VALUES ${valuesChunk
                            .map(a => `(${a.map(() => "?").join(", ")})`)
                            .join(", ")}`
                    ),
                };
            });
        }
    }

    private static validValues(values: Array<ValueType[]>): boolean {
        if (values.length < 1)
            throw new DatabaseBuilderError(`Values not informed`);
        const sizeInnerArray = values?.[0].length;
        if (sizeInnerArray < 1)
            throw new DatabaseBuilderError(`Inner values not informed`);
        if (!values.every(x => x.length === sizeInnerArray))
            throw new DatabaseBuilderError(`Values with different size not suportted, values: ${JSON.stringify(values)}`);
        return true;
    }

    public static batchInsertColumn<T>(tableName: string, columns: MapperColumn[], models: Array<T>)
        : QueryCompiled[] {
        return this.batchInsert(tableName, columns.map(x => x.column),
            models.map(model => {
                return columns.map(column => Utils.getValue<any, any>(model, column.fieldReference)?.[0])
            })
        );
    }

    public static batchInsertMapper<T>(mapper: MapperTable, models: Array<T>)
        : QueryCompiled[] {
        return this.batchInsertColumn(mapper.tableName, mapper.columns, models);
    }

    private static splitChunks(sourceArray: any[], chunkSize: number): any[][] {
        const result: any[][] = [];
        for (var i = 0; i < sourceArray.length; i += chunkSize) {
            result[i / chunkSize] = sourceArray.slice(i, i + chunkSize);
        }
        return result;
    }
}