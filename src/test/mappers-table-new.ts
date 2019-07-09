import { GuidClazz } from "./models/guid-clazz";
import { LoginOffline } from "./models/login-offline";
import { TestClazzList } from "./models/test-clazz-list";
import { TestClazzRef } from "./models/test-clazz-ref";
import { TestClazz } from "./models/test-clazz";
import { CondicaoPagamento } from "./models/condicao-pagamento";
import { Marca } from "./models/marca";
import { Pedido } from "./models/pedido";
import { Classificacao } from "./models/classificacao";
import { Cliente } from "./models/cliente";
import { SubRegiao } from "./models/sub-regiao";
import { Uf } from "./models/uf";
import { Cidade } from "./models/cidade";
import { Regiao } from "./models/regiao";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { MapperSettingsModel } from "../mapper/mapper-settings-model";
import { HeaderSimple } from "./models/header-simple";
import { GetMapper } from "../mapper/interface-get-mapper";
import { ReferencesModelTest } from "./models/reference-model-test";
import { Linha } from "./models/linha";
import { Referencia } from "./models/referencia";
import { Estrutura } from "./models/estrutura";
import { Imagem } from "./models/imagem";
import { MapperTest } from "./mapper-test";
import { ModeloDetalheProduto } from "./models/modelo-detalhe-produto";
import { ContasAReceber } from "./models/contas-a-receber";
import { DatabaseTypes } from "../definitions/database-types";

export class MappersTableNew extends MapperTest {

    constructor() {
        super();

        this.mapper(GuidClazz)
            .key(x => x.guid, PrimaryKeyType.Guid, String)
            .column(x => x.description, String);
        // .hasQueryFilter(where => where.equal(x => x.guid, "a"));

        this.autoMapperIdImport(Regiao, Number, PrimaryKeyType.Assigned)
            .hasQueryFilter(where => where.startsWith(x => x.nome, "S"));
        this.autoMapperIdImport(SubRegiao, Number, PrimaryKeyType.Assigned)
            .hasQueryFilter(where => where.lessAndEqual(x => x.codeImport, 100000));
        this.autoMapperIdImport(Uf, String, PrimaryKeyType.Assigned);
        this.autoMapperIdImport(Cidade, Number, PrimaryKeyType.Assigned)
            .reference(x => x.uf, Uf)
            .hasQueryFilter(where => where.great(x => x.population, 0));
        this.autoMapperIdImport(Classificacao, Number, PrimaryKeyType.Assigned);
        // this.autoMapperModelInternalKey(Cliente, Number, PrimaryKeyType.AutoIncrement);
        const mCliente = this.autoMapperId(Cliente, PrimaryKeyType.Guid);

        // console.log('mapper cliente', mCliente.mapperTable.columns.map(x => JSON.stringify(x)));
        // console.log(`cliente primary key:`, mCliente.mapperTable.columns.filter(x => !!x.primaryKeyType).map(x => JSON.stringify(x)));
        this.autoMapperModelInternalKey(Marca, Number, PrimaryKeyType.AutoIncrement);
        this.autoMapperIdImport(CondicaoPagamento, Number, PrimaryKeyType.Assigned);
        this.autoMapperModelInternalKey(Pedido, Number, PrimaryKeyType.AutoIncrement);
        // this.autoMapperModelInternalKey(ContasReceber, Number, PrimaryKeyType.AutoIncrement)
        //     .column(x => x.dataRecebimento, DatabaseTypes.Moment)
        //     .ignore(x => x.cliente)
        //     .referenceKey(x => x.cliente, x => x.codeImport);
        this.autoMapperIdErp(ContasAReceber, PrimaryKeyType.Assigned)
            .column(x => x.dataRecebimento, DatabaseTypes.DateString)
            .ignore(x => x.cliente)
            .referenceKey(x => x.cliente, x => x.idErp);

        this.autoMapper(TestClazzRef, x => x.id, PrimaryKeyType.AutoIncrement)
            .reference(x => x.autoReference, TestClazzRef)
            ;

        this.mapper(TestClazzRefCode)
            .key(x => x.code, PrimaryKeyType.Assigned, String)
            .column(x => x.description, String)
            .referenceKey(x => x.reference, x => x.description)
            ;
        this.autoMapperKey(TestClazz, PrimaryKeyType.AutoIncrement)
            .column(x => x.dateStr, DatabaseTypes.DateString)
            .ignore(x => x.disabled);

        this.autoMapperKey(TestClazzList, PrimaryKeyType.AutoIncrement);

        this.mapper(ReferencesModelTest)
            .key(x => x.id, PrimaryKeyType.AutoIncrement, Number)
            .column(x => x.name, String);

        const settingsReference: MapperSettingsModel = {
            references: true,
            referencesId: false,
            referencesIdRecursive: false
        };
        this.autoMapperKey(LoginOffline, PrimaryKeyType.AutoIncrement, false, settingsReference);

        this.mapper(HeaderSimple)
            .key(x => x.id, PrimaryKeyType.AutoIncrement, Number)
            .column(x => x.descricao, String)
            .hasMany(x => x.items, String, "ItemHeaderSimple")
            ;

        this.autoMapperKey(Imagem, PrimaryKeyType.Assigned);
        this.autoMapper(Linha, x => x.codeImport, PrimaryKeyType.Assigned, Number);
        this.autoMapper(Referencia, x => x.codeImport, PrimaryKeyType.Assigned, Number)
            .hasMany(x => x.referenciasRelacionadas, Referencia, "ReferenciasRelacionadas")
            ;
        this.autoMapper(Estrutura, x => x.codeImport, PrimaryKeyType.Assigned, Number);

        this.mapper(ModeloDetalheProduto, true)
            .key(x => x.codeImport, void 0, Number)
            //   .reference(x => x.caracteristica, Caracteristica)
            //   .reference(x => x.material, Material)
            .column(x => x.observacao, String)
            .column(x => x.variacao, Boolean);
    }
}

// tslint:disable-next-line:label-position
let _mapper: GetMapper = void 0;
export const getMapper = (): GetMapper => {
    return _mapper ? _mapper : _mapper = new MappersTableNew();
};