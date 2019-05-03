import { expect } from "chai";
import { ContasAReceber } from "./models/contas-a-receber";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { Cliente } from "./models/cliente";
import { Regiao } from "./models/regiao";
import { SubRegiao } from "./models/sub-regiao";
import { Uf } from "./models/uf";
import { Cidade } from "./models/cidade";
import { Classificacao } from "./models/classificacao";
import { Expression } from "lambda-expression";
import { Utils } from "../core/utils";
import { MapperTest } from "./mapper-test";

describe("Mapper", () => {

    const mapperBase = new MapperTest();

    it("testeContasReceber", () => {
        mapperBase.autoMapperIdImport(Regiao, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(SubRegiao, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(Uf, String, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(Cidade, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(Classificacao, Number, PrimaryKeyType.Assigned);
        const mCliente = mapperBase.autoMapperId(Cliente, PrimaryKeyType.Guid);
        // .column(x => x.codeImport, Number);
        let m = mapperBase.autoMapperIdErp(ContasAReceber, PrimaryKeyType.Assigned);
        const expressionClienteKey: Expression<ContasAReceber> = (x => x.cliente.id);
        expect(m.mapperTable.getColumnByField(expressionClienteKey).column).to.equal(Utils.getColumn(expressionClienteKey));
        m = m.ignore(x => x.cliente);
        expect(m.mapperTable.getColumnByField(expressionClienteKey)).to.equal(void 0);
        m = m.referenceKey(x => x.cliente, x => x.idErp);
        const expressionClienteCodeImport: Expression<ContasAReceber> = (x => x.cliente.idErp);
        expect(m.mapperTable.getColumnByField(expressionClienteCodeImport).column).to.equal(Utils.getColumn(expressionClienteCodeImport));
    });

});