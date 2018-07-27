import { BaseModel } from "./base-model";

export class Regiao extends BaseModel<number> {

    public nome: string = "";

    constructor(instance?: Regiao) {
        super(instance ? instance.codeImport : -1);
        if (instance) {
            Object.assign(this, instance);
        }
    }
}
