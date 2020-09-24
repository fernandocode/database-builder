import { BaseModel } from "./base-model";
import { Imagem } from "./imagem";

export class Referencia extends BaseModel<number> {
    public codigo: string = "";
    public descricao: string = "";
    public restricaoGrade: string[];
    public referenciasRelacionadas: Referencia[];
    public imagem: Imagem;
    public deleted: boolean = false;
}