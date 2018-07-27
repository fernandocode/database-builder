import { BaseModel } from "./base-model";

export class Marca extends BaseModel<number> {
    public descricao: string = "";

    constructor() {
        super(0);
    }
}
