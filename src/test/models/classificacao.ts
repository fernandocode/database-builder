import { BaseModel } from "./base-model";

export class Classificacao extends BaseModel<number> {

    public descricao: string = "";

    constructor() {
        super(-1);
    }
}
