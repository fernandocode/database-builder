import { Regiao } from "./regiao";
import { BaseImport } from "./base-import";

export class SubRegiao extends BaseImport<number> {

    public nome: string = "";
    public regiao: Regiao = new Regiao();

    constructor() {
        super(-1);
    }
}
