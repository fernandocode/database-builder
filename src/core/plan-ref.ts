
export class PlanRef {
    constructor(
        public value?: string
    ) {

    }

    public result(): string {
        return this.value;
    }
}
