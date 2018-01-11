import * as moment from 'moment';

export type ValueType = number | string | boolean;
export type ValueTypeToParse = ValueType | moment.Moment | Date | Object;

export interface QueryCompiled {
    query: string;
    params: ValueType[];
}

export interface IQueryCompilable {
    compile(): { query: string, params: ValueType[] };
}

export interface ResultExecuteSql {
    rows: RowsResultExecuteSql;
    rowsAffected: number;
    insertId: number;
}

export interface RowsResultExecuteSql {
    item(key: number): any;
    length: number;
}

export interface CrudCompiled {
    sql: string;
    params: ValueType[];
}

export interface CrudInsertCompiled {
    columns: string;
    values: string;
}

export interface ColumnsCompiled extends ColumnsBaseCompiled {
    params: ValueType[];
}

export interface ColumnsBaseCompiled {
    columns: string[];
}

export interface Column {
    value: ValueType;
    name: string;
    type: FieldType;
}

export enum OrderBy {
    ASC = "ASC",
    DESC = "DESC"
}

export enum ColumnType {
    TEXT = "TEXT",
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN"
}

export enum FieldType {
    STRING,
    NUMBER,
    BOOLEAN,
    DATE,
    OBJECT, 
    FUNCTION
}