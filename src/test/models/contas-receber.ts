import { Cliente } from "./cliente";
import { BaseModel } from "./base-model";
import * as moment from "moment";

export class ContasReceber extends BaseModel<number>  {

    public valor: number = 0;
    public cliente: Cliente = new Cliente();
    // Deixar esse valor nulo para teste
    public dataRecebimento: moment.Moment;
    public dataVencimento: moment.Moment = moment();

}
