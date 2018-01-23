import { Classificacao } from './classificacao';
import { BaseModel } from './base-model';
import { Cidade } from './cidade';

export class Cliente extends BaseModel<number> {

    constructor() {
        super(0);
    }

    public razaoSocial: string = "";
    public apelido: string = "";
    public cidade: Cidade = new Cidade();    
    public classificacao: Classificacao = new Classificacao();
    public desativo: boolean = false;
}
