import { ParamType } from "../core/utils";

export class ProjectionModel {

    constructor(
        public projection: string = "",
        public params: ParamType[] = [],
    ) {

    }
}
