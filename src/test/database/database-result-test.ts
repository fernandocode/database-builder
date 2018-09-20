import { DatabaseRowListTest } from "./database-row-list-test";
import { DatabaseResult, DatabaseRowList } from "../../definitions/database-definition";

export class DatabaseResultTest implements DatabaseResult {

    constructor(
        public rows: DatabaseRowList = new DatabaseRowListTest([]),
        public rowsAffected: number = 0,
        public insertId: any = void 0
    ) {

    }
}