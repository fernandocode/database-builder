import { ProjectionsHelper } from "../core/projections-helper";
import { ParamType, ProjectionOrValue, Utils, ValueTypeToParse } from "../core/utils";
import { CaseWhen } from "./enums/case-when";
import { BuilderCompiled } from "../core/builder-compiled";
import { ProjectionBuilder } from "./projection-builder";
import { WhereCompiled } from "./where-compiled";
import { WhereBuilder } from "./where-builder";
import { ProjectionCompile } from "./projection-compile";

export class ProjectionCaseWhen<T> {

    private _whenBuilder: BuilderCompiled = new BuilderCompiled();

    public constructor(value: WhereBuilder<T> | ValueTypeToParse) {
        this._whenBuilder.builder = "WHEN ";
        if (Utils.isWhereBuilder(value)) {
            const whereCompiled: WhereCompiled = (value as WhereBuilder<T>).compile();
            this.build(whereCompiled.where, whereCompiled.params);
        } else {
            this.build(value as ValueTypeToParse, []);
        }
    }

    public then(projection: ProjectionOrValue<T>): ProjectionCaseWhen<T> {
        return this.projection(CaseWhen.Then, projection);
    }

    public else(projection: ProjectionOrValue<T>): ProjectionCaseWhen<T> {
        return this.projection(CaseWhen.Else, projection);
    }

    // WHEN {expression} THEN {result} [ELSE {result}]
    public compile(): BuilderCompiled {
        return this._whenBuilder;
    }

    private build(value: ValueTypeToParse, params: ParamType[]) {
        this._whenBuilder.builder += Utils.getValueType(value);
        this._whenBuilder.params = this._whenBuilder.params.concat(params);
    }

    private projection(type: CaseWhen, projection: ProjectionOrValue<T>): ProjectionCaseWhen<T> {
        if (Utils.isProjectionsHelper(projection)) {
            const projectionCompiled = ProjectionCompile.compile((projection as ProjectionsHelper<T>)._result());
            this._whenBuilder.builder += ` ${type} ${projectionCompiled.projection}`;
            this._whenBuilder.params = this._whenBuilder.params.concat(projectionCompiled.params);
        } else if (Utils.isProjectionBuilder(projection)) {
            const projectionCompiled = ProjectionCompile.compile((projection as ProjectionBuilder<T>).result());
            // const projectionCompiled = (projection as ProjectionBuilder<T>).compile();
            this._whenBuilder.builder += ` ${type} ${projectionCompiled.projection}`;
            this._whenBuilder.params = this._whenBuilder.params.concat(projectionCompiled.params);
        } else {
            this._whenBuilder.builder += ` ${type} ${Utils.getValueType(projection)}`;
        }
        return this;
    }
}
