import { BuilderCompiled } from "../core/builder-compiled";
import { WhereBuilder } from "./where-builder";
import { ExpressionOrColumn, Utils, ValueType } from "../core/utils";
import { ExpressionUtils } from "lambda-expression";
import { ProjectionCaseWhen } from "./projection-case-when";

export class ProjectionCase<T> {

    private _caseBuilder: BuilderCompiled = new BuilderCompiled();

    public constructor(
        expression: ExpressionOrColumn<T> = void 0,
        private _alias: string = void 0,
    ) {
        this._caseBuilder.builder = "CASE";
        if (expression) {
            this._caseBuilder.builder += ` ${Utils.getColumn(expression)}`;
        }
    }

    public when(
        value: WhereBuilder<T> | ValueType,
        whenCallback: (when: ProjectionCaseWhen<T>) => void,
    ): ProjectionCase<T> {
        const instanceWhen: ProjectionCaseWhen<T> = new ProjectionCaseWhen(value);
        whenCallback(instanceWhen);
        this.compileWhen(instanceWhen.compile());
        return this;
    }

    // CASE {expression} {when} END
    public compile(): BuilderCompiled {
        const result: BuilderCompiled = new BuilderCompiled(this._caseBuilder.builder, this._caseBuilder.params);
        if (result.builder.length) {
            result.builder += " END";
            if (this._alias) {
                result.builder += ` AS ${this._alias}`;
            }
        }
        return result;
    }

    private compileWhen(compiled: BuilderCompiled) {
        if (compiled.builder.length) {
            this._caseBuilder.builder += ` ${compiled.builder}`;
            compiled.params.forEach((value) => {
                this._caseBuilder.params.push(value);
            });
        }
    }
}
