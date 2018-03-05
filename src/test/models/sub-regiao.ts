import { BaseModel } from "./base-model";
import { Regiao } from "./regiao";

export class SubRegiao extends BaseModel<number> {

    public nome: string = "";
    public regiao: Regiao = new Regiao();

    constructor() {
        super(0);
    }
}
