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
import { GuidClazz } from "./models/guid-clazz";
import { Query } from "../crud";

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

    it("hasQueryFilter", () => {
        const mapperGuidClass = mapperBase.mapper(GuidClazz)
            .key(x => x.guid, PrimaryKeyType.Guid, String)
            .column(x => x.description, String)
            .hasQueryFilter(where => where.equal(x => x.guid, ":a"));
        expect(mapperGuidClass.mapperTable.queryFilter.where).to.equal("{<replacableAlias>}.guid = ?");
        expect(mapperGuidClass.mapperTable.queryFilter.params[0]).to.equal(":a");

        const query = new Query(GuidClazz, void 0, (tKey: (new () => any) | string) => {
            return mapperBase.get(tKey);
        }, mapperGuidClass.mapperTable);
        console.log(query.compile());
    });

});