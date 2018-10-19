import { BaseModel } from "./base-model";
import { Imagem } from "./imagem";

export class Linha extends BaseModel<number> {
    public codigo: string = "";
    public nome: string = "";
    public imagem: Imagem = new Imagem();
    public deleted: boolean = false;

    constructor(instance?: Linha) {
        super(instance ? instance.codeImport : -1);
        if (instance) {
            Object.assign(this, instance);
        }
    }
}