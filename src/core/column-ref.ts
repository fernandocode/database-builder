
export class ColumnRef {
    constructor(
        public column?: string,
        public alias?: string
    ) {

    }

    public result(): string {
        return `${this.alias}.${this.column}`;
    }
}
