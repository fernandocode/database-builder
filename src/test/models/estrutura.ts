import { Referencia } from "./referencia";
import { Linha } from "./linha";
import { Imagem } from "./imagem";
import { BaseModel } from "./base-model";

export class Estrutura extends BaseModel<number> {
    public referencia: Referencia = new Referencia();
    public linha: Linha = new Linha();
    public imagem: Imagem = new Imagem();
    public observacao: string = "";
    public deleted: boolean = false;

    // constructor(instance?: Estrutura) {
    //     super(instance ? instance.codeImport : -1);
    //     if (instance) {
    //         Object.assign(this, instance);
    //     }
    // }
}