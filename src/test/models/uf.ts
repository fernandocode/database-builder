import { BaseImport } from "./base-import";

export class Uf extends BaseImport<string> {

    public nome: string = "";
    public population: number = 0;

    constructor() {
        super("");
    }
}
