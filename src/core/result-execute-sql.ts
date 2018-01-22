import { RowsResultExecuteSql } from "./rows-result-execute-sql";

export interface ResultExecuteSql {
    rows: RowsResultExecuteSql;
    rowsAffected: number;
    insertId: number;
}
