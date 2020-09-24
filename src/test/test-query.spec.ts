import { Cliente } from "./models/cliente";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { Operator } from "../crud/enums/operator";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud/crud";

describe("Query method", () => {

    const mapper = getMapper();
    const crud = new Crud({ getMapper: mapper });

    it("test simple select", () => {
        const query = crud.query(Cliente);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT cli.idErp AS idErp, cli.versao AS versao, cli.id AS id, cli.deleted AS deleted, cli.razaoSocial AS razaoSocial, cli.nomeFantasia AS nomeFantasia, cli.cidade_codeImport AS cidade_codeImport, cli.change AS change FROM Cliente AS cli");
    });

    it("test simple select with custom alias", () => {
        const result = crud.query(Cliente, { alias: "abc" }).compile()[0].query;
        expect(result).to.equal("SELECT abc.idErp AS idErp, abc.versao AS versao, abc.id AS id, abc.deleted AS deleted, abc.razaoSocial AS razaoSocial, abc.nomeFantasia AS nomeFantasia, abc.cidade_codeImport AS cidade_codeImport, abc.change AS change FROM Cliente AS abc");
    });

    it("test simple select with custom alias and where equal", () => {
        const result =
            crud.query(Cliente, { alias: "abc" })
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                })
                .compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].query).to.equal(`SELECT abc.idErp AS idErp, abc.versao AS versao, abc.id AS id, abc.deleted AS deleted, abc.razaoSocial AS razaoSocial, abc.nomeFantasia AS nomeFantasia, abc.cidade_codeImport AS cidade_codeImport, abc.change AS change FROM Cliente AS abc WHERE abc.razaoSocial = ?`);
    });

    it("test select with scope", () => {
        const query =
            crud.query(Cliente, { alias: "abc" })
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                    where.scope(scope => {
                        scope.greatValue(x => x.cidade.population, 10)
                            .or()
                            .lessAndEqualValue(x => x.cidade.codeImport, 100);
                    });
                });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].params[2]).to.equal(100);
        expect(result[0].query).to.equal(`SELECT abc.idErp AS idErp, abc.versao AS versao, abc.id AS id, abc.deleted AS deleted, abc.razaoSocial AS razaoSocial, abc.nomeFantasia AS nomeFantasia, abc.cidade_codeImport AS cidade_codeImport, abc.change AS change FROM Cliente AS abc WHERE abc.razaoSocial = ? AND (abc.cidade_population > ? OR abc.cidade_codeImport <= ?)`);
    });

    it("test simple select with where and select projections", () => {
        const query =
            crud.query(Cliente)
                .select(
                    x => x.cidade.codeImport,
                    x => x.nomeFantasia,
                    x => x.razaoSocial,
                    x => x.idErp)
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                    where.greatAndEqualValue(x => x.idErp, 10);
                });
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.nomeFantasia AS nomeFantasia, cli.razaoSocial AS razaoSocial, cli.idErp AS idErp FROM Cliente AS cli WHERE cli.razaoSocial = ? AND cli.idErp >= ?`);
    });

    it("test select with join", () => {
        const query = crud.query(Cliente);
        query
            .ignoreQueryFilters()
            .select(
                x => x.cidade.codeImport,
                x => x.nomeFantasia,
                x => x.razaoSocial,
                x => x.idErp
            )
            .projection(projection => {
                projection.add(x => x.deleted, "inativo");
            })
            .where(where => {
                where.not().equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.idErp, 10);
            })
            .join(
                Cidade,
                onWhere =>
                    onWhere.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)),
                join => {
                    join.projection(projection => {
                        projection.add(x => x.nome, "cidade_nome");
                        projection.add(x => x.codeImport);
                    });
                }
            );

        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.nomeFantasia AS nomeFantasia, cli.razaoSocial AS razaoSocial, cli.idErp AS idErp, cli.deleted AS inativo, cid.nome AS cidade_nome, cid.codeImport AS cid_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) WHERE cli.razaoSocial <> ? AND cli.idErp >= ?`);
    });

    it("test select with projection case", () => {
        const query = crud.query(Cliente);
        query
            .ignoreQueryFilters()
            .projection(projection => {
                projection.add(x => x.deleted, "inativo");
                projection.case((caseInstance) => {
                    caseInstance.when(
                        query.createWhere()
                            .great(projection.proj().sum(x => x.cidade.codeImport), 1),
                        (when) => {
                            when.then(
                                projection.proj().group(
                                    "",
                                    projection.proj().sum(x => x.cidade.codeImport),
                                    projection.plan(Operator.Multiply),
                                    projection.plan(2)
                                )
                            ).else(0);
                        }
                    );
                }, void 0, "cidadeTest");
            })
            .where(where => {
                where.equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.idErp, 10);
            })
            .join(
                Cidade,
                onWhere =>
                    onWhere.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)),
                join => {
                    join.projection(projection => {
                        projection.all();
                    });
                }
            );

        const result = query.compile();

        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal(1);
        expect(result[0].params[1]).to.equal("ABC");
        expect(result[0].params[2]).to.equal(10);
        expect(result[0].query).to.equal(`SELECT cli.deleted AS inativo, CASE WHEN SUM(cli.cidade_codeImport) > ? THEN (SUM(cli.cidade_codeImport) * 2) ELSE 0 END AS cidadeTest, cid.codeImport AS cid_codeImport, cid.nome AS cid_nome, cid.population AS cid_population, cid.subRegiao_codeImport AS cid_subRegiao_codeImport, cid.uf_codeImport AS cid_uf_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) WHERE cli.razaoSocial = ? AND cli.idErp >= ?`);
    });

    it("test select all by mapper", () => {
        const query = crud.query(Cliente);
        query
            .ignoreQueryFilters()
            .projection(projection => {
                projection.allByMap(mapper.get(Cliente));
            })
            .join(Cidade,
                onWhere =>
                    onWhere.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)),
                join => {
                    join.projection(projection => {
                        projection.allByMap(mapper.get(Cidade));
                    });
                });

        const result = query.compile();

        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal(`SELECT cli.idErp AS idErp, cli.versao AS versao, cli.id AS id, cli.deleted AS deleted, cli.razaoSocial AS razaoSocial, cli.nomeFantasia AS nomeFantasia, cli.cidade_codeImport AS cidade_codeImport, cli.change AS change, cid.codeImport AS cid_codeImport, cid.nome AS cid_nome, cid.population AS cid_population, cid.subRegiao_codeImport AS cid_subRegiao_codeImport, cid.uf_codeImport AS cid_uf_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport)`);
    });

    // TODO: query from query

});
