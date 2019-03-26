import { Classificacao } from "./classificacao";
import { BaseModel } from "./base-model";
import { Cidade } from "./cidade";

export class Cliente extends BaseModel<number> {

    public razaoSocial: string = "";
    public apelido: string = "";
    public cidade: Cidade = new Cidade();
    public classificacao: Classificacao = new Classificacao();
    public desativo: boolean = false;
}
