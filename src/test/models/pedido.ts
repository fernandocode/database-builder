import { CondicaoPagamento } from "./condicao-pagamento";
import { Marca } from "./marca";
import { Cliente } from "./cliente";
import { BaseModel } from "./base-model";

export class Pedido extends BaseModel<number> {

    public cliente: Cliente = new Cliente();
    public marca: Marca = new Marca();
    public condicaoPagamento: CondicaoPagamento = new CondicaoPagamento();

    constructor() {
        super(0);
    }
}
