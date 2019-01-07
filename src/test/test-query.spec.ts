import { Cliente } from "./models/cliente";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { Operator } from "../crud/enums/operator";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud/crud";

describe("Query method", () => {

    const mapper = getMapper();
    const crud = new Crud({} as any, mapper);

    it("test simple select", () => {
        const query = crud.query(Cliente);
        const result = query.compile();
        expect(result[0].params.length).to.equal(0);
        expect(result[0].query).to.equal("SELECT cli.internalKey AS internalKey, cli.codeImport AS codeImport, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS cli");
    });

    it("test simple select with custom alias", () => {
        const result = crud.query(Cliente, "abc").compile()[0].query;
        expect(result).to.equal("SELECT abc.internalKey AS internalKey, abc.codeImport AS codeImport, abc.razaoSocial AS razaoSocial, abc.apelido AS apelido, abc.desativo AS desativo, abc.cidade_codeImport AS cidade_codeImport, abc.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS abc");
    });

    it("test simple select with custom alias and where equal", () => {
        const result =
            crud.query(Cliente, "abc")
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                })
                .compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].query).to.equal(`SELECT abc.internalKey AS internalKey, abc.codeImport AS codeImport, abc.razaoSocial AS razaoSocial, abc.apelido AS apelido, abc.desativo AS desativo, abc.cidade_codeImport AS cidade_codeImport, abc.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS abc WHERE abc.razaoSocial = ?`);
    });

    it("test select with scope", () => {
        const query =
            crud.query(Cliente, "abc")
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                    where.scope(scope => {
                        scope.greatValue(x => x.classificacao.codeImport, 10)
                            .or()
                            .lessAndEqualValue(x => x.cidade.codeImport, 100);
                    });
                });
        const result = query.compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].params[2]).to.equal(100);
        expect(result[0].query).to.equal(`SELECT abc.internalKey AS internalKey, abc.codeImport AS codeImport, abc.razaoSocial AS razaoSocial, abc.apelido AS apelido, abc.desativo AS desativo, abc.cidade_codeImport AS cidade_codeImport, abc.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS abc WHERE abc.razaoSocial = ? AND (abc.classificacao_codeImport > ? OR abc.cidade_codeImport <= ?)`);
    });

    it("test simple select with where and select projections", () => {
        const query =
            crud.query(Cliente)
                .select(
                    x => x.cidade.codeImport,
                    x => x.apelido,
                    x => x.razaoSocial,
                    x => x.codeImport)
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                    where.greatAndEqualValue(x => x.codeImport, 10);
                });
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("ABC");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.codeImport AS codeImport FROM Cliente AS cli WHERE cli.razaoSocial = ? AND cli.codeImport >= ?`);
    });

    it("test select with join", () => {
        const query = crud.query(Cliente);
        query
            .select(
                x => x.cidade.codeImport,
                x => x.apelido,
                x => x.razaoSocial,
                x => x.codeImport
            )
            .projection(projection => {
                projection.add(x => x.desativo, "inativo");
            })
            .where(where => {
                where.not().equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.codeImport, 10);
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
        expect(result[0].query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.codeImport AS codeImport, cli.desativo AS inativo, cid.nome AS cidade_nome, cid.codeImport AS cid_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) WHERE cli.razaoSocial <> ? AND cli.codeImport >= ?`);
    });

    it("test select with projection case", () => {
        const query = crud.query(Cliente);
        query
            .projection(projection => {
                projection.add(x => x.desativo, "inativo");
                projection.case((caseInstance) => {
                    caseInstance.when(
                        query.createWhere()
                            .great(projection.proj().sum(x => x.classificacao.codeImport), 1),
                        (when) => {
                            when.then(
                                projection.proj().group(
                                    "",
                                    projection.proj().sum(x => x.classificacao.codeImport),
                                    projection.plan(Operator.Multiply),
                                    projection.plan(2)
                                )
                            ).else(0);
                        }
                    );
                }, void 0, "classificacaoTest");
            })
            .where(where => {
                where.equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.codeImport, 10);
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
        expect(result[0].query).to.equal(`SELECT cli.desativo AS inativo, CASE WHEN SUM(cli.classificacao_codeImport) > ? THEN (SUM(cli.classificacao_codeImport) * 2) ELSE 0 END AS classificacaoTest, cid.codeImport AS cid_codeImport, cid.nome AS cid_nome, cid.population AS cid_population, cid.uf_codeImport AS cid_uf_codeImport, cid.subRegiao_codeImport AS cid_subRegiao_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) WHERE cli.razaoSocial = ? AND cli.codeImport >= ?`);
    });

    it("test select all by mapper", () => {
        const query = crud.query(Cliente);
        query
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
        expect(result[0].query).to.equal(`SELECT cli.internalKey AS internalKey, cli.codeImport AS codeImport, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport, cid.codeImport AS cid_codeImport, cid.nome AS cid_nome, cid.population AS cid_population, cid.uf_codeImport AS cid_uf_codeImport, cid.subRegiao_codeImport AS cid_subRegiao_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport)`);
    });

    // TODO: query from query

});
