import { BaseImport } from "./base-import";

export class Regiao extends BaseImport<number> {

    public nome: string = "";

    constructor(instance?: Regiao) {
        super(instance ? instance.codeImport : -1);
        if (instance) {
            Object.assign(this, instance);
        }
    }
}
