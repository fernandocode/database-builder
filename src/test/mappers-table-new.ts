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
import { MapperSettingsModel } from "..";

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

        this.add(Regiao, x => x.codeImport, false);
        this.add(SubRegiao, x => x.codeImport, false);
        this.add(Uf, x => x.codeImport, false);
        this.add(Cidade, x => x.codeImport, false);
        this.add(Classificacao, x => x.codeImport, false);
        this.add(Cliente, x => x.internalKey, true);
        this.add(Marca, x => x.internalKey, true);
        this.add(CondicaoPagamento, x => x.codeImport, false);
        this.add(Pedido, x => x.internalKey, true);

        this.add(TestClazzRef, x => x.id, true);
        this.add(TestClazzRefCode, x => x.code, true);
        this.add(TestClazz, x => x.internalKey, true);

        this.add(TestClazzList, x => x.internalKey, true);

        const settingsReference: MapperSettingsModel = {
            references: true,
            referencesId: false,
            referencesIdRecursive: false
        };
        this.add(LoginOffline, x => x.internalKey, true, false, settingsReference);

    }
}
