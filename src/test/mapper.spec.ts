import { expect } from "chai";
import { ContasReceber } from "./models/contas-receber";
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
        mapperBase.autoMapper(Regiao, x => x.codeImport, PrimaryKeyType.Assigned);
        mapperBase.autoMapper(SubRegiao, x => x.codeImport, PrimaryKeyType.Assigned);
        mapperBase.autoMapper(Uf, x => x.codeImport, PrimaryKeyType.Assigned);
        mapperBase.autoMapper(Cidade, x => x.codeImport, PrimaryKeyType.Assigned);
        mapperBase.autoMapper(Classificacao, x => x.codeImport, PrimaryKeyType.Assigned);
        mapperBase.autoMapper(Cliente, x => x.internalKey, PrimaryKeyType.AutoIncrement)
            .column(x => x.codeImport, Number);
        let m = mapperBase.autoMapperIdErp(ContasReceber, Number, PrimaryKeyType.AutoIncrement);        
        const expressionClienteKey: Expression<ContasReceber> = (x => x.cliente.internalKey);
        expect(m.mapperTable.getColumnByField(expressionClienteKey).column).to.equal(Utils.getColumn(expressionClienteKey));
        m = m.ignore(x => x.cliente);
        expect(m.mapperTable.getColumnByField(expressionClienteKey)).to.equal(void 0);
        m = m.referenceKey(x => x.cliente, x => x.codeImport);
        const expressionClienteCodeImport: Expression<ContasReceber> = (x => x.cliente.codeImport);
        expect(m.mapperTable.getColumnByField(expressionClienteCodeImport).column).to.equal(Utils.getColumn(expressionClienteCodeImport));
    });

});