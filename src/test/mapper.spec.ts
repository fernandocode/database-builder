import { Cidade } from "./models/cidade";
import { expect } from "chai";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { Cliente } from "./models/cliente";
import { Regiao } from "./models/regiao";
import { SubRegiao } from "./models/sub-regiao";
import { Uf } from "./models/uf";
import { ContasAReceber } from "./models/contas-a-receber";
import { Classificacao } from "./models/classificacao";
import { Expression } from "lambda-expression";
import { Utils } from "../core/utils";
import { MapperTest } from "./mapper-test";
import { GuidClazz } from "./models/guid-clazz";

describe("Mapper", () => {

    const mapperBase = new MapperTest();

    it("testeContasReceber", () => {
        mapperBase.autoMapperIdImport(Regiao, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(SubRegiao, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(Uf, String, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(Cidade, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperIdImport(Classificacao, Number, PrimaryKeyType.Assigned);
        mapperBase.autoMapperId(Cliente, PrimaryKeyType.Guid);
        let m = mapperBase.autoMapperIdErp(ContasAReceber, PrimaryKeyType.Assigned);
        const expressionClienteKey: Expression<ContasAReceber> = (x => x.cliente.id);
        expect(m.mapperTable.getColumnByField(expressionClienteKey).column).to.equal(Utils.getColumn(expressionClienteKey));
        m = m.ignore(x => x.cliente);
        expect(m.mapperTable.getColumnByField(expressionClienteKey)).to.equal(void 0);
        m = m.referenceKey(x => x.cliente, x => x.idErp);
        const expressionClienteCodeImport: Expression<ContasAReceber> = (x => x.cliente.idErp);
        expect(m.mapperTable.getColumnByField(expressionClienteCodeImport).column).to.equal(Utils.getColumn(expressionClienteCodeImport));
    });

    const mapperGuidClass = mapperBase.mapper(GuidClazz)
        .key(x => x.guid, PrimaryKeyType.Guid, String)
        .column(x => x.description, String)
        .hasQueryFilter(where => where.equal(x => x.guid, ":id"));

    it("hasQueryFilter mapper", () => {
        expect(mapperGuidClass.mapperTable.queryFilter.where).to.equal(`(${Utils.REPLACEABLE_ALIAS}.guid = ?)`);
        expect(mapperGuidClass.mapperTable.queryFilter.params[0]).to.equal(":id");
    });

});