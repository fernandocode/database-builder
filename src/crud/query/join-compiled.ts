import { ValueType } from "../../core/utils";
import { JoinQueryBuilder } from "./join-query-builder";

export class JoinCompiled {

    public joins: Array<JoinQueryBuilder<any>> = [];
    constructor(
        public params: ValueType[] = [],
    ) {

    }
}
