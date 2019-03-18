import { ProjectionModel } from "./projection-model";
import { ProjectionCompiled } from "./projection-compiled";

export class ProjectionCompile {

    public static compile(projections: ProjectionModel[]): ProjectionCompiled {
        const projectionCompiled: ProjectionCompiled = new ProjectionCompiled();
        projections.forEach(projection => {
            projectionCompiled.projection += projectionCompiled.projection.length > 0 ? ", " : ""
            projectionCompiled.projection += projection.projection;
            projectionCompiled.params = projectionCompiled.params.concat(projection.params);
        });
        return projectionCompiled;
    }
}