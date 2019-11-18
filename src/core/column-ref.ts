import { Resultable } from "./resultable";

export class ColumnRef implements Resultable {
    constructor(
        public column?: string,
        public alias?: string
    ) {

    }

    public result(): string {
        if (this.alias) {
            return `${this.alias}.${this.column}`;
        }
        return this.column;
    }
}
