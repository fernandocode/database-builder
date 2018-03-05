import { Query } from "./../crud/query/query";
import { Regiao } from "./models/regiao";
import { Uf } from "./models/uf";
import { Classificacao } from "./models/classificacao";
import { ProjectionCompiled } from "./../crud/projection-compiled";
import { Projection } from "./../crud/enums/projection";
import { SubRegiao } from "./models/sub-regiao";
import { Cliente } from "./models/cliente";
import { assert, expect } from "chai";
import { Cidade } from "./models/cidade";
import { Operator } from "../crud/enums/operator";
import { Crud, Insert } from "../index";
import { MappersTable } from "./mappers-table";

const mappersTable = new MappersTable();

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
                        scope.greatValue(x => x.classificacao.id, 10)
                            .or()
                            .lessAndEqualValue(x => x.cidade.id, 100);
                    });
                });
        const result = query.compile();
        expect(result.params.length).to.equal(3);
        expect(result.params[0]).to.equal("ABC");
        expect(result.params[1]).to.equal(10);
        expect(result.params[2]).to.equal(100);
        expect(result.query).to.equal(`SELECT abc.* FROM Cliente AS abc WHERE abc.razaoSocial = ? AND (abc.classificacao_id > ? OR abc.cidade_id <= ?)`);
    });

    it("test simple select with where and select projections", () => {
        const query =
            new Query(Cliente)
                .select(select => {
                    select.columns(
                        x => x.cidade.id,
                        x => x.apelido,
                        x => x.razaoSocial,
                        x => x.id
                    );
                })
                .where(where => {
                    where.equalValue(x => x.razaoSocial, "ABC");
                    where.greatAndEqualValue(x => x.id, 10);
                });
        const result = query.compile();
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("ABC");
        expect(result.params[1]).to.equal(10);
        expect(result.query).to.equal(`SELECT cli.cidade_id AS cidade_id, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.id AS id FROM Cliente AS cli WHERE cli.razaoSocial = ? AND cli.id >= ?`);
    });

    it("test select with join", () => {
        const query = new Query(Cliente);
        query
            .select(select => {
                select.columns(
                    x => x.cidade.id,
                    x => x.apelido,
                    x => x.razaoSocial,
                    x => x.id
                );
                select.add(x => x.desativo, "inativo");
            })
            .where(where => {
                where.not().equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.id, 10);
            })
            .join(
                Cidade,
                onWhere =>
                    onWhere.equal(x => x.id, query.ref2(x => x.cidade.id)),
                join => {
                    join.select(select => {
                        select.add(x => x.nome, "cidade_nome");
                        select.add(x => x.id); // cid_id
                    });
                }
            );

        const result = query.compile();
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("ABC");
        expect(result.params[1]).to.equal(10);
        expect(result.query).to.equal(`SELECT cli.cidade_id AS cidade_id, cli.apelido AS apelido, cli.razaoSocial AS razaoSocial, cli.id AS id, cli.desativo AS inativo, cid.nome AS cidade_nome, cid.id AS cid_id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.id = cli.cidade_id) WHERE cli.razaoSocial <> ? AND cli.id >= ?`);
    });

    it("test select with projection case", () => {
        const query = new Query(Cliente);
        query
            .select(select => {
                select.add(x => x.desativo, "inativo");
                select.case((caseInstance) => {
                    caseInstance.when(
                        query.createWhere()
                            .great(select.proj().sum(x => x.classificacao.id), 1),
                        // .greatValue(select.create().projection(Projection.Sum, x => x.classificacao.id).projection, 1),
                        (when) => {
                            when.then(
                                select.proj().group(
                                    "",
                                    select.proj().sum(x => x.classificacao.id),
                                    select.plan(Operator.Multiply),
                                    select.plan(2)
                                )
                                // select.create().group(
                                //     "",
                                //     select.projection(Projection.Sum, x => x.classificacao.id),
                                //     Operator.Multiply,
                                //     2
                                // )
                            ).else(0);
                        }
                    );
                }, void 0, "classificacaoTest");
            })
            .where(where => {
                where.equalValue(x => x.razaoSocial, "ABC");
                where.greatAndEqualValue(x => x.id, 10);
            })
            .join(
                Cidade,
                onWhere =>
                    onWhere.equal(x => x.id, query.ref2(x => x.cidade.id)),
                join => {
                    join.select(select => {
                        select.all();
                    });
                }
            );

        const result = query.compile();

        expect(result.params.length).to.equal(3);
        expect(result.params[0]).to.equal(1);
        expect(result.params[1]).to.equal("ABC");
        expect(result.params[2]).to.equal(10);
        expect(result.query).to.equal(`SELECT cli.desativo AS inativo, CASE WHEN SUM(cli.classificacao_id) > ? THEN (SUM(cli.classificacao_id) * 2) ELSE 0 END AS classificacaoTest, cid.* FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.id = cli.cidade_id) WHERE cli.razaoSocial = ? AND cli.id >= ?`);
    });

    it("test select all by mapper", () => {
        const query = new Query(Cliente);
        query
            .select(select => {
                select.allByMap(mappersTable.getMapper(Cliente));
            })
            .join(Cidade,
                onWhere =>
                    onWhere.equal(x => x.id, query.ref2(x => x.cidade.id)),
                join => {
                    join.select(select => {
                        select.allByMap(mappersTable.getMapper(Cidade));
                    });
                });

        const result = query.compile();

        expect(result.params.length).to.equal(0);
        expect(result.query).to.equal(`SELECT cli.id AS id, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_id AS cidade_id, cli.classificacao_id AS classificacao_id, cid.id AS cid_id, cid.nome AS cid_nome, cid.uf_id AS cid_uf_id, cid.subRegiao_id AS cid_subRegiao_id FROM Cliente AS cli LEFT JOIN Cidade AS cid ON (cid.id = cli.cidade_id)`);
    });

    // TODO: query from query

});
