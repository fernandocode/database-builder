import { BaseModel } from './base-model';

export class Classificacao extends BaseModel<number> {
    
    constructor(){
        super(-1);
    }
    
    public descricao: string = "";
}