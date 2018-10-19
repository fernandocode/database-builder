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
import { MapperBase } from "./../mapper/mapper-base";
import { DatabaseHelper } from "../database-helper";
import { Regiao } from "./models/regiao";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { MapperSettingsModel } from "../mapper/mapper-settings-model";
import { ContasReceber } from "./models/contas-receber";
import { HeaderSimple } from "./models/header-simple";
import { GetMapper } from "../mapper/interface-get-mapper";
import { ReferencesModelTest } from "./models/reference-model-test";
import { Linha } from "./models/linha";
import { Referencia } from "./models/referencia";
import { Estrutura } from "./models/estrutura";
import { Imagem } from "./models/imagem";

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

        this.mapper(GuidClazz)
            .key(x => x.guid, PrimaryKeyType.Guid, String)
            .column(x => x.description, String);

        this.autoMapper(Regiao, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(SubRegiao, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(Uf, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(Cidade, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(Classificacao, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(Cliente, x => x.internalKey, PrimaryKeyType.AutoIncrement);
        this.autoMapper(Marca, x => x.internalKey, PrimaryKeyType.AutoIncrement);
        this.autoMapper(CondicaoPagamento, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(Pedido, x => x.internalKey, PrimaryKeyType.AutoIncrement);
        this.autoMapper(ContasReceber, x => x.internalKey, PrimaryKeyType.AutoIncrement)
            .ignore(x => x.cliente)
            .referenceKey(x => x.cliente, x => x.codeImport);

        this.autoMapper(TestClazzRef, x => x.id, PrimaryKeyType.AutoIncrement)
            .reference(x => x.autoReference, TestClazzRef)
            ;

        this.mapper(TestClazzRefCode)
            .key(x => x.code, PrimaryKeyType.Assigned, String)
            .column(x => x.description, String)
            .referenceKey(x => x.reference, x => x.description)
            ;
        this.autoMapper(TestClazz, x => x.internalKey, PrimaryKeyType.AutoIncrement)
            .ignore(x => x.disabled);

        this.autoMapper(TestClazzList, x => x.internalKey, PrimaryKeyType.AutoIncrement);

        this.mapper(ReferencesModelTest)
            .key(x => x.id, PrimaryKeyType.AutoIncrement, Number)
            .column(x => x.name, String);

        const settingsReference: MapperSettingsModel = {
            references: true,
            referencesId: false,
            referencesIdRecursive: false
        };
        this.autoMapper(LoginOffline, x => x.internalKey, PrimaryKeyType.AutoIncrement, false, settingsReference);

        this.mapper(HeaderSimple)
            .key(x => x.id, PrimaryKeyType.AutoIncrement, Number)
            .column(x => x.descricao, String)
            .hasMany(x => x.items, String, "ItemHeaderSimple")
            ;

        this.autoMapper(Imagem, x => x.internalKey, PrimaryKeyType.Assigned);
        this.autoMapper(Linha, x => x.codeImport, PrimaryKeyType.Assigned);
        this.autoMapper(Referencia, x => x.codeImport, PrimaryKeyType.Assigned)
            .hasMany(x => x.referenciasRelacionadas, Referencia, "ReferenciasRelacionadas")
            // .hasOne()
            ;
        this.autoMapper(Estrutura, x => x.codeImport, PrimaryKeyType.Assigned);
    }
}

// tslint:disable-next-line:label-position
let _mapper: GetMapper = void 0;
export const getMapper = (): GetMapper => {
    return _mapper ? _mapper : _mapper = new MappersTableNew();
};
