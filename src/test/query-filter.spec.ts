import { Cidade } from "./models/cidade";
import { expect } from "chai";
import { PrimaryKeyType } from "../core/enums/primary-key-type";
import { Cliente } from "./models/cliente";
import { Regiao } from "./models/regiao";
import { SubRegiao } from "./models/sub-regiao";
import { MapperTest } from "./mapper-test";
import { GuidClazz } from "./models/guid-clazz";
import { Crud } from "../crud";
import { getMapper } from "./mappers-table-new";
import { JoinQueryBuilder } from "../crud/query/join-query-builder";
import { ParamFilter } from "../core/param-filter";

describe("Query filter", () => {

    const mapperBase = new MapperTest();
    const crud = new Crud({ sqliteLimitVariables: 10000 }, { getMapper: getMapper() });

    const mapperGuidClass = mapperBase.mapper(GuidClazz)
        .key(x => x.guid, PrimaryKeyType.Guid, String)
        .column(x => x.description, String)
        .hasQueryFilter(where => where.equal(x => x.guid, ParamFilter.builder("id")).or().isNull(x => x.guid));

    // it("QueryFilter mapper", () => {
    //     expect(mapperGuidClass.mapperTable.queryFilter.where).to.equal(`(${Utils.REPLACEABLE_ALIAS}.guid = ? OR ${Utils.REPLACEABLE_ALIAS}.guid IS NULL)`);
    //     expect(mapperGuidClass.mapperTable.queryFilter.params[0]).to.equal(ParamFilter.builder("id"));
    // });

    // it("QueryFilter ignoreQueryFilters", () => {
    //     const query = crud.query(GuidClazz, "ab", mapperGuidClass);
    //     const result = query.ignoreQueryFilters().compile();
    //     expect(result[0].query).to.equal("SELECT ab.guid AS guid, ab.description AS description FROM GuidClazz AS ab");
    //     expect(result[0].params.length).to.equal(0);
    // });

    it("QueryFilter with parameter", () => {
        const query = crud.query(GuidClazz, { alias: "ab", metadata: mapperGuidClass });
        const result = query
            .setParamsQueryFilter({ id: 100 })
            .compile();
        expect(result[0].query).to.equal("SELECT ab.guid AS guid, ab.description AS description FROM GuidClazz AS ab WHERE (ab.guid = ? OR ab.guid IS NULL)");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(100);
    });

    it("QueryFilter with value", () => {
        const query = crud.query(Cidade).select(x => x.nome);
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cid.nome AS nome FROM Cidade AS cid WHERE (cid.population > ?)");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(0);
    });

    it("QueryFilter join default", () => {
        const query = crud.query(Cidade).select(x => x.nome);
        query.join(SubRegiao, on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)), _join => _join);
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cid.nome AS nome FROM Cidade AS cid LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport) WHERE (cid.population > ?)");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(0);
    });

    it("QueryFilter join enableQueryFilters", () => {
        const query = crud.query(Cidade).select(x => x.nome);
        query.join(SubRegiao, on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)), _join => _join.enableQueryFilters());
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cid.nome AS nome FROM Cidade AS cid LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport AND (sub.codeImport <= ?)) WHERE (cid.population > ?)");
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(100000);
        expect(result[0].params[1]).to.equal(0);
    });

    it("QueryFilter join deep default", () => {
        const query = crud.query(Cliente)
            .select(x => x.id);
        let joinCidade: JoinQueryBuilder<Cidade>;
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(Cidade, on => on.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)), join => joinCidade = join);
        query.join(SubRegiao, on => on.equal(x => x.codeImport, joinCidade.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join);
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)), _join => { });
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cli.id AS id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport)");
        expect(result[0].params.length).to.equal(0);
    });

    it("QueryFilter join deep enableQueryFilters in join", () => {
        const query = crud.query(Cliente)
            .select(x => x.id);
        let joinCidade: JoinQueryBuilder<Cidade>;
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(Cidade, on => on.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)), join => joinCidade = join.enableQueryFilters());
        query.join(SubRegiao, on => on.equal(x => x.codeImport, joinCidade.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join.enableQueryFilters());
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)),
            join => join.enableQueryFilters()
                .setParamsQueryFilter({ startWith: "S" })
        );
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cli.id AS id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport AND (cid.population > ?)) LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport AND (sub.codeImport <= ?)) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport AND (reg.nome LIKE ?))");
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(0);
        expect(result[0].params[1]).to.equal(100000);
        expect(result[0].params[2]).to.equal("S%");
    });

    it("QueryFilter join deep enableQueryFilters only one join", () => {
        const query = crud.query(Cliente)
            .select(x => x.id);
        let joinCidade: JoinQueryBuilder<Cidade>;
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(Cidade, on => on.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)), join => joinCidade = join);
        query.join(SubRegiao, on => on.equal(x => x.codeImport, joinCidade.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join.enableQueryFilters());
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)), _join => { });
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cli.id AS id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport AND (sub.codeImport <= ?)) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport)");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(100000);
    });

    it("QueryFilter join deep enableQueryFilters two joins", () => {
        const query = crud.query(Cliente)
            .select(x => x.id);
        let joinCidade: JoinQueryBuilder<Cidade>;
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(Cidade, on => on.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)), join => joinCidade = join.enableQueryFilters());
        query.join(SubRegiao, on => on.equal(x => x.codeImport, joinCidade.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join);
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)),
            join => join.enableQueryFilters()
                .setParamsQueryFilter({ startWith: "N" })
        );
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cli.id AS id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport AND (cid.population > ?)) LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport AND (reg.nome LIKE ?))");
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal(0);
        expect(result[0].params[1]).to.equal("N%");
    });

    it("QueryFilter join deep ignoreQueryFilters all", () => {
        const query = crud.query(Cliente).select(x => x.id).ignoreQueryFilters();
        let joinCidade: JoinQueryBuilder<Cidade>;
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(Cidade, on => on.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)), join => joinCidade = join);
        query.join(SubRegiao, on => on.equal(x => x.codeImport, joinCidade.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join);
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)), _join => { });
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cli.id AS id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport)");
        expect(result[0].params.length).to.equal(0);
    });

    it("QueryFilter join deep default Cidade", () => {
        const query = crud.query(Cidade)
            .select(x => x.codeImport);
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(SubRegiao, on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join);
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)), _join => { });
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cid.codeImport AS codeImport FROM Cidade AS cid LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport) WHERE (cid.population > ?)");
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(0);
    });

    it("QueryFilter join deep enableQueryFilters in join Cidade", () => {
        const query = crud.query(Cidade)
            .select(x => x.codeImport);
        let joinSubRegiao: JoinQueryBuilder<SubRegiao>;
        query.join(SubRegiao, on => on.equal(x => x.codeImport, query.ref(x => x.subRegiao.codeImport)), join => joinSubRegiao = join.enableQueryFilters());
        query.join(Regiao, on => on.equal(x => x.codeImport, joinSubRegiao.ref(x => x.regiao.codeImport)),
            join => join.enableQueryFilters().setParamsQueryFilter({ startWith: "N" })
        );
        const result = query.compile();
        expect(result[0].query).to.equal("SELECT cid.codeImport AS codeImport FROM Cidade AS cid LEFT JOIN SubRegiao AS sub ON (sub.codeImport = cid.subRegiao_codeImport AND (sub.codeImport <= ?)) LEFT JOIN Regiao AS reg ON (reg.codeImport = sub.regiao_codeImport AND (reg.nome LIKE ?)) WHERE (cid.population > ?)");
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(100000);
        expect(result[0].params[1]).to.equal("N%");
        expect(result[0].params[2]).to.equal(0);
    });
});