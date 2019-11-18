import { Resultable } from "./resultable";

export class PlanRef implements Resultable {
    constructor(
        public value?: string
    ) {

    }

    public result(): string {
        return this.value;
    }
}
