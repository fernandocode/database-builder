import { Cliente } from "./cliente";
import { BaseModel } from "./base-model";

export class ContasReceber extends BaseModel<number>  {

    public valor: number = 0;
    public cliente: Cliente = new Cliente();

    constructor() {
        super(0);

    }
}
