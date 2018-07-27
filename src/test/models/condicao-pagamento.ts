import { BaseModel } from "./base-model";

export class CondicaoPagamento extends BaseModel<number> {

    public nome: string = "";

    constructor() {
        super(0);
    }
}
