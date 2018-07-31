import { BaseImport } from "./base-import";

export class CondicaoPagamento extends BaseImport<number> {

    public nome: string = "";

    constructor() {
        super(0);
    }
}
