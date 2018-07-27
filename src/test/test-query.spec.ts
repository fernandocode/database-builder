import { Query } from "../crud/query/query";
import { Cliente } from "./models/cliente";
import { expect } from "chai";
import { Cidade } from "./models/cidade";
import { Operator } from "../crud/enums/operator";
// import { MappersTable } from "./mappers-table";

// const mappersTable = new MappersTable();

describe("Query method", () => {

    it("test simple select", () => {
        const query = new Query(Cliente);
        const result = query.compile();
        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal("SELECT cli.* FROM Cliente AS cli");
    });

    it("test simple select with custom alias", () => {
        const result = new Query(Cliente, "abc").compile().query;
        expect(result).to.equal("SELECT abc.* FROM Cliente AS abc");
    });

    it("test simple select with custom alias and where equal", () => {
        const result =
            new Query(Cliente, "abc")
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                })
                .compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal("ABC");
        expect(result.query).to.equal(`SELECT abc.* FROM Cliente AS abc WHERE abc.razaoSocial = ?`);
    });

    it("test select with scope", () => {
        const query =
            new Query(Cliente, "abc")
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                    where.scope(scope => {
                        scope.greatValue(x => x.classificacao.codeImport, 10)
                            .or()
                            .lessAndEqualValue(x => x.cidade.codeImport, 100);
                    });
                });
        const result = query.compile();
        expect(result.params.length).to.equal(3);
        expect(result.params[0]).to.equal("ABC");
        expect(result.params[1]).to.equal(10);
        expect(result.params[2]).to.equal(100);
        expect(result.query).to.equal(`SELECT abc.* FROM Cliente AS abc WHERE abc.razaoSocial = ? AND (abc.classificacao_codeImport > ? OR abc.cidade_codeImport <= ?)`);
    });

    it("test simple select with where and select projections", () => {
        const query =
            new Query(Cliente)
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
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("ABC");
        expect(result.params[1]).to.equal(10);
        expect(result.query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.codeImport AS codeImport FROM Cliente AS cli WHERE cli.razaoSocial = ? AND cli.codeImport >= ?`);
    });

    it("test select with join", () => {
        const query = new Query(Cliente);
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
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("ABC");
        expect(result.params[1]).to.equal(10);
        expect(result.query).to.equal(`SELECT cli.cidade_codeImport AS cidade_codeImport, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.codeImport AS codeImport, cli.desativo AS inativo, cid.nome AS cidade_nome, cid.codeImport AS cid_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) WHERE cli.razaoSocial <> ? AND cli.codeImport >= ?`);
    });

    it("test select with projection case", () => {
        const query = new Query(Cliente);
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

        expect(result.params.length).to.equal(3);
        expect(result.params[0]).to.equal(1);
        expect(result.params[1]).to.equal("ABC");
        expect(result.params[2]).to.equal(10);
        expect(result.query).to.equal(`SELECT cli.desativo AS inativo, CASE WHEN SUM(cli.classificacao_codeImport) > ? THEN (SUM(cli.classificacao_codeImport) * 2) ELSE 0 END AS classificacaoTest, cid.* FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport) WHERE cli.razaoSocial = ? AND cli.codeImport >= ?`);
    });

    it("test select all by mapper", () => {
        const query = new Query(Cliente);
        query
            // TODO: comment
            // .projection(projection => {
            //     projection.allByMap(mappersTable.getMapper(Cliente));
            // })
            .join(Cidade,
                onWhere =>
                    onWhere.equal(x => x.codeImport, query.ref(x => x.cidade.codeImport)),
                join => {
                    // TODO: comment
                    // join.projection(projection => {
                    //     projection.allByMap(mappersTable.getMapper(Cidade));
                    // });
                });

        const result = query.compile();

        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal(`SELECT cli.internalKey AS internalKey, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport, cli.codeImport AS codeImport, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cid.internalKey AS cid_internalKey, cid.codeImport AS cid_codeImport, cid.nome AS cid_nome, cid.uf_codeImport AS cid_uf_codeImport, cid.subRegiao_codeImport AS cid_subRegiao_codeImport FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.codeImport = cli.cidade_codeImport)`);
    });

    // TODO: query from query

});
