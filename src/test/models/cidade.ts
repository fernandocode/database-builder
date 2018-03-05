import { BaseModel } from "./base-model";
import { SubRegiao } from "./sub-regiao";
import { Uf } from "./uf";

export class Cidade extends BaseModel<number> {

    public nome: string = "";
    public uf: Uf = new Uf();
    public subRegiao: SubRegiao = new SubRegiao();

    constructor(instance?: Cidade) {
        super(instance ? instance.id : -1);
        if (instance) {
            Object.assign(this, instance);
        }
    }
}
