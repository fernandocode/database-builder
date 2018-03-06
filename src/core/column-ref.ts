
export class ColumnRef {
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
