import { BaseModel } from './base-model';
import { Regiao } from './regiao';

export class SubRegiao extends BaseModel<number> {

    constructor() {
        super(0);
    }

    public nome: string = "";
    public regiao: Regiao = new Regiao();
}