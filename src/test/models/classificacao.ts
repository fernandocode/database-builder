import { BaseImport } from "./base-import";

export class Classificacao extends BaseImport<number> {

    public descricao: string = "";

    constructor() {
        super(-1);
    }
}
