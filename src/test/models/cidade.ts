import { SubRegiao } from "./sub-regiao";
import { Uf } from "./uf";
import { BaseImport } from "./base-import";

export class Cidade extends BaseImport<number> {

    public nome: string = "";
    public uf: Uf;
    public subRegiao: SubRegiao = new SubRegiao();
    public population: number = 0;

    constructor(instance?: Cidade) {
        super(instance ? instance.codeImport : -1);
        if (instance) {
            Object.assign(this, instance);
        }
    }
}
