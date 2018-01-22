import { ValueType } from "./utils";

export class BuilderCompiled {

    constructor(
        public builder: string = "",
        public params: ValueType[] = []) {
    }
}
