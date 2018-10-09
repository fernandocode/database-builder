import { ParamType } from "./utils";

export class BuilderCompiled {

    constructor(
        public builder: string = "",
        public params: ParamType[] = []) {
    }
}
