import { BaseModelId } from "./base/base-model-id";
import { Cidade } from "./cidade";

export class Cliente extends BaseModelId {
    // public cnpj: string = "";
    // conceito: Conceito = new Conceito();
    // public contato: string = "";
    // public credito: number = 0;
    // public inscricaoEstadual: string = "";
    public razaoSocial: string = "";
    // dataCadastro: moment.Moment = moment();
    public nomeFantasia: string = "";
    // public tipoFrete: number = 0;
    // public suframa: string = "";
    // tipoCobranca: TipoCobranca = new TipoCobranca();
    // portador: Portador = new Portador();
    // public observacao: string = "";
    // public observacaoProducao: string = "";
    // public observacaoFinanceira: string = "";
    // classificacao: ClassificacaoCliente = new ClassificacaoCliente();
    // public regimeTributario: number = 0;
    // tipoParceria: TipoParceria = new TipoParceria();
    // public considerarSomenteRegraNegociacaoCliente: boolean = false;
    // regrasNegociacao: Array<RegraNegociacao> = [];
    // enderecos: Array<ClienteEndereco> = [];
    // emails: Array<ClienteEmail> = [];
    // telefones: Array<ClienteTelefone> = [];
    // public detalhes: string;

    // FOR TEST
    public cidade: Cidade = new Cidade();
}

// import { Classificacao } from "./classificacao";
// import { BaseModel } from "./base-model";
// import { Cidade } from "./cidade";

// export class Cliente extends BaseModel<number> {

//     public razaoSocial: string = "";
//     public apelido: string = "";
//     public cidade: Cidade = new Cidade();
//     public classificacao: Classificacao = new Classificacao();
//     public desativo: boolean = false;
// }
