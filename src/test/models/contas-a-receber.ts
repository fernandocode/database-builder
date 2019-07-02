import { Cliente } from "./cliente";
import { BaseModelErp } from "./base/base-model-erp";
import * as moment from "moment";

export class ContasAReceber extends BaseModelErp {
    // public numero: string = "";
    // public dataEmissao: moment.Moment = moment();
    public cliente: Cliente = new Cliente();
    public dataVencimento: moment.Moment = moment();
    public dataRecebimento: string;
    // public dataProtesto: moment.Moment = moment();
    // public dataEnvioCartorio: moment.Moment = moment();
    // public dataCobrancaJuros: moment.Moment = moment();
    // public tipoJuros: number = 0;
    // public numeroNFS: number = 0;
    // public percentualJuros: number = 0;
    public valor: number = 0;
    // public valorRecebido: number = 0;
    // public cancelado: boolean = false;
    // representante: Representante = new Representante();
}