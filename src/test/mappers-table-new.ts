import { CondicaoPagamento } from './models/condicao-pagamento';
import { Marca } from './models/marca';
import { Pedido } from './models/pedido';
import { Classificacao } from './models/classificacao';
import { Cliente } from './models/cliente';
import { SubRegiao } from "./models/sub-regiao";
import { Uf } from "./models/uf";
import { Cidade } from "./models/cidade";
import { MapperBase } from "./../mapper/mapper-base";
import { DatabaseHelper } from "../database-helper";
import { Regiao } from "./models/regiao";

export class MappersTableNew extends MapperBase {

    constructor() {
        super(
            new DatabaseHelper(),
            {
                references: false,
                referencesId: true,
                referencesIdRecursive: false
            }
        );

        this.add(Regiao, x => x.codeImport, true);
        this.add(SubRegiao, x => x.codeImport, true);
        this.add(Uf, x => x.codeImport, true);
        this.add(Cidade, x => x.codeImport, true);
        this.add(Classificacao, x => x.codeImport, true);
        this.add(Cliente, x => x.internalKey, true);
        this.add(Marca, x => x.internalKey, true);
        this.add(CondicaoPagamento, x => x.codeImport, true);
        this.add(Pedido, x => x.internalKey, true);

        // this.mapper(false, void 0, this._defaultSettings,
        //     Representante,
        //     MetaDiariaEmpresa,
        //     MetaDiariaRepresentante,
        //     RelacaoRepresentantePreposto,
        //     Classificacao,
        //     Cliente,
        //     Cidade,
        //     Uf,
        //     SubRegiao,
        //     Regiao,
        //     Empresa,
        //     IndicadoresInadimplenciaContasAReceberOffline,
        //     IndicadoresInadimplenciaContasAPagarOffline,
        //     IndicadoresDevolucaoOffline,
        // );

        // this.mapper(false, void 0, {
        //     references: true,
        //     referencesId: false,
        //     referencesIdRecursive: false
        // },
        //     IndicadoresSaldoConta,
        //     IndicadoresRecebimentosPagamentosPorPeriodo,
        //     IndicadoresProducaoPorPeriodo,
        //     IndicadoresFaturamentoPorPeriodo,
        //     IndicadoresComprasPorPeriodo,
        //     LoginOffline,
        //     LastSync
        // );

        // // readonly
        // this.mapper(true, void 0, {
        //     references: false,
        //     referencesId: false,
        //     referencesIdRecursive: false
        // },
        //     IndicadoresVendasRepresentantePorPeriodo,
        //     IndicadoresHomeResumoFinanceiro,
        //     IndicadoresHomeResumoComprasFaturamento
        // );

        // this.add(IndicadoresVendasOffline, false, void 0, {
        //     references: true,
        //     referencesId: true,
        //     referencesIdRecursive: false
        // }, metadata => {
        //     metadata
        //         .mapper(x => x.cliente.cidade.id)
        //         .mapper(x => x.cliente.cidade.uf.id)
        //         .mapper(x => x.cliente.cidade.subRegiao.id)
        //         .mapper(x => x.cliente.classificacao.id)

        //         // futuramente todas as referencias extras de clientes poderão ser removidas dessa tabela pois a tabela de cliente estará disponivel offline, necessitando nessa apenas a referencia ao cliente
        //         .mapper(x => x.comprador.cidade.id)
        //         .mapper(x => x.comprador.cidade.uf.id)
        //         .mapper(x => x.comprador.cidade.subRegiao.id)
        //         .mapper(x => x.comprador.classificacao.id);
        // });

        // this.add(RelacaoClienteRepresentante, false, void 0, {
        //     references: true,
        //     referencesId: true,
        //     referencesIdRecursive: false
        // }, metadata => {
        //     metadata
        //         // futuramente todas as referencias extras de clientes poderão ser removidas dessa tabela pois a tabela de cliente estará disponivel offline, necessitando nessa apenas a referencia ao cliente
        //         .mapper(x => x.cliente.cidade.id)
        //         .mapper(x => x.cliente.cidade.uf.id)
        //         .mapper(x => x.cliente.cidade.subRegiao.id);
        // });

    }
}
