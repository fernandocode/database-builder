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
import { Crud, Query } from "../crud";
import { TestClazz } from "./models/test-clazz";
import { getMapper } from "./mappers-table-new";

describe("Mapper", () => {

    const mapperBase = new MapperTest();
    const crud = new Crud({} as any, getMapper());

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

    const mapperGuidClass = mapperBase.mapper(GuidClazz)
        .key(x => x.guid, PrimaryKeyType.Guid, String)
        .column(x => x.description, String)
        .hasQueryFilter(where => where.equal(x => x.guid, ":id"));

    it("hasQueryFilter mapper", () => {
        expect(mapperGuidClass.mapperTable.queryFilter.where).to.equal(`${Utils.REPLACEABLE_ALIAS}.guid = ?`);
        expect(mapperGuidClass.mapperTable.queryFilter.params[0]).to.equal(":id");
    });

    it("hasQueryFilter ignoreQueryFilters", () => {
        const query = crud.query(GuidClazz, "ab", mapperGuidClass);
        const result = query.ignoreQueryFilters().compile();
        expect(result[0].query).to.equal("SELECT ab.guid AS guid, ab.description AS description FROM GuidClazz AS ab");
        expect(result[0].params.length).to.equal(0);
    });

    it("hasQueryFilter with parameter", () => {
        const query = crud.query(GuidClazz, "ab", mapperGuidClass);
        const result = query.setParamsQueryFilter({ id: 100 }).compile();
        expect(result[0].query).to.equal("SELECT ab.guid AS guid, ab.description AS description FROM GuidClazz AS ab WHERE ab.guid = ?");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(100);
    });

    it("hasQueryFilter with value", () => {
        const query = crud.query(Cidade).select(x => x.nome);
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cid.nome AS nome FROM Cidade AS cid WHERE cid.population > ?");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(0);
    });

    // it("hasQueryFilter join", () => {
    //     const query = crud.query(Cidade).select(x => x.nome);
    //     query.join(SubRegiao, on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)), _join => {
    //         console.log(_join.mapperTable.queryFilter);
    //     });
    //     const result = query.compile();
    //     expect(result[0].query).to.equal("SELECT cid.nome AS nome FROM Cidade AS cid LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport) WHERE cid.population > ? AND sub.codeImport <= ?");
    //     expect(result[0].params.length).to.equal(2);
    //     expect(result[0].params[0]).to.equal(0);
    //     expect(result[0].params[0]).to.equal(100000);
    // });

});