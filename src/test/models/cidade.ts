import { BaseModel } from './base-model';
import { SubRegiao } from './sub-regiao';
import { Uf } from './uf';

export class Cidade extends BaseModel<number> {

    constructor(instance?: Cidade) {
        super(instance ? instance.id : -1);
        if (instance)
            Object.assign(this, instance);
    }

    public nome: string = "";
    public uf: Uf = new Uf();
    public subRegiao: SubRegiao = new SubRegiao();
}
