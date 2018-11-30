
export interface SQLite3Interface {
    new(filename: string, callback?: (err: Error | null) => void): SQLite3ObjectInterface;
    new(filename: string, mode?: number, callback?: (err: Error | null) => void): SQLite3ObjectInterface;
}
export interface SQLite3ObjectInterface {
    all(sql: string, params: any, callback?: (this: any, err: Error | null, rows: any[]) => void): this;
    run(sql: string, params: any, callback?: (this: SQLite3RunResult, err: Error | null) => void): this;
}
export interface SQLite3RunResult {
    lastID: number;
    changes: number;
}