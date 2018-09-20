import { DatabaseRowList } from "../../definitions/database-definition";

export class DatabaseRowListTest implements DatabaseRowList {

    constructor(private _items: any[]) {

    }

    get length(): number {
        return this._items.length;
    }

    public item(index: number) {
        return this._items[index];
    }
}