import { ParamType } from "../core/utils";

export class ProjectionCompiled {

    constructor(
        public projection: string = "",
        public params: ParamType[] = [],
    ) {

    }
}
