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
import { Create, Insert } from "..";

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
        m = m.referenceKey(x => x.clienteNotInitialized, x => x.idErp, Number);
        const expressionClienteCodeImport: Expression<ContasAReceber> = (x => x.cliente.idErp);
        const expressionClienteNotInitializedCodeImport: Expression<ContasAReceber> = (x => x.clienteNotInitialized.idErp);
        expect(m.mapperTable.getColumnByField(expressionClienteCodeImport).column).to.equal(Utils.getColumn(expressionClienteCodeImport));
        expect(m.mapperTable.getColumnByField(expressionClienteNotInitializedCodeImport).column).to.equal(Utils.getColumn(expressionClienteNotInitializedCodeImport));
    });

    const mapperGuidClass = mapperBase.mapper(GuidClazz)
        .key(x => x.guid, PrimaryKeyType.Guid, String)
        .column(x => x.description, String)
        .hasQueryFilter(where => where.equal(x => x.guid, ":id"));

    it("hasQueryFilter mapper", () => {
        expect(mapperGuidClass.mapperTable.queryFilter.where).to.equal(`(${Utils.REPLACEABLE_ALIAS}.guid = ?)`);
        expect(mapperGuidClass.mapperTable.queryFilter.params[0]).to.equal(":id");
    });

    it("mapper sub property", () => {
        mapperBase.clear();
        const mapper = mapperBase.mapper(SubRegiao)
            .key(x => x.codeImport, PrimaryKeyType.Assigned, Number)
            .column(x => x.nome, String)
            .column(x => x.regiao.codeImport, Number);

        const create = new Create(SubRegiao, mapper.mapperTable);

        expect(create.compile()[0].query).to.equal("CREATE TABLE IF NOT EXISTS SubRegiao( codeImport INTEGER NOT NULL PRIMARY KEY, nome TEXT, regiao_codeImport INTEGER )");

        const subRegiao = { nome: "test", codeImport: 1, regiao: { codeImport: 2 } as Regiao } as SubRegiao;

        const insert = new Insert(SubRegiao, { modelToSave: subRegiao, mapperTable: mapper.mapperTable });

        const insertCompiled = insert.compile()[0];

        expect(insertCompiled.query).to.equal("INSERT INTO SubRegiao (codeImport, nome, regiao_codeImport) VALUES (?, ?, ?)");
        expect(insertCompiled.params.join(", ")).to.equal([1, "test", 2].join(", "));
    });
});