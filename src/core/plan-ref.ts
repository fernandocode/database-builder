import { Resultable } from "./resultable";

export class PlanRef implements Resultable {
    constructor(
        public value?: any
    ) {

    }

    public result(): string {
        return `${this.value}`;
    }
}
