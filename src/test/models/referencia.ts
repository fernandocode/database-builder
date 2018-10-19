import { BaseModel } from "./base-model";
import { Imagem } from "./imagem";

export class Referencia extends BaseModel<number> {
    public codigo: string = "";
    public descricao: string = "";
    public restricaoGrade: string[];
    // public colecao: Colecao = new Colecao();
    // public tipoProduto: TipoProduto = new TipoProduto();
    public referenciasRelacionadas: Referencia[];
    public imagem: Imagem;
    public deleted: boolean = false;

    constructor(instance?: Referencia) {
        super(instance ? instance.codeImport : -1);
        if (instance) {
            Object.assign(this, instance);
        }
    }
}