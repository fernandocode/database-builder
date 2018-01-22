import { ValueType } from "../core/utils";

export class ProjectionCompiled {

    constructor(
        public projection: string = "",
        public params: ValueType[] = [],
    ) {

    }
}
