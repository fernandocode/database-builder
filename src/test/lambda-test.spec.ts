import { Cliente } from "./models/cliente";
import { Query } from "../crud/query/query";

import { expect } from "chai";
import { Crud } from "../crud/crud";
import { getMapper } from "./mappers-table-new";

describe("Lambda Expression", () => {

    const crud = new Crud({} as any, getMapper());

    it("simple lambda", () => {
        const query = crud.query(Cliente)
            .where(where => {
                // For test double equals
                // tslint:disable-next-line:triple-equals
                where.expression(x => x.apelido == "Test");
                where.equalValue(x => x.razaoSocial, "R");
            });
        const result = query.compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("Test");
        expect(result[0].params[1]).to.equal("R");
        expect(result[0].query).to.equal("SELECT cli.codeImport AS codeImport, cli.internalKey AS internalKey, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS cli WHERE cli.apelido = ? AND cli.razaoSocial = ?");
    });

    it("simple lambda with whereExp", () => {
        const result = crud.query(Cliente)
            .whereExp(x => x.apelido === "Test")
            .whereExp(x => x.codeImport > 10)
            .compile();
        expect(result[0].params.length).to.equal(2);
        expect(result[0].params[0]).to.equal("Test");
        expect(result[0].params[1]).to.equal(10);
        expect(result[0].query).to.equal("SELECT cli.codeImport AS codeImport, cli.internalKey AS internalKey, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS cli WHERE cli.apelido = ? AND cli.codeImport > ?");
    });

    it("lambda with ValueType's", () => {
        const result = crud.query(Cliente)
            .where(where => {
                where
                    .expression(x => x.apelido === "Test")
                    .expression(x => x.codeImport > 2)
                    .expression(x => x.desativo !== false)
                    ;
            })
            .compile();
        expect(result[0].params.length).to.equal(3);
        expect(result[0].params[0]).to.equal("Test");
        // expect(result[0].params[1]).to.equal(2);
        expect(result[0].params[2]).to.equal(false);
        expect(result[0].query).to.equal("SELECT cli.codeImport AS codeImport, cli.internalKey AS internalKey, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS cli WHERE cli.apelido = ? AND cli.codeImport > ? AND cli.desativo <> ?");
    });

    // // Not work in lambda expression
    // it("lambda column vs variable", () => {
    //     let p1 = "Test";
    //     const result = crud.query(Cliente)
    //     .where(where => {
    //         where
    //         .exp(x => x.apelido == p1)
    //         .exp(x => x.id > 2)
    //         .exp(x => x.desativo != false)
    //         ;
    //     })
    //     .compile();
    //     console.log(result);
    //     expect(result[0].params.length).to.equal(3);
    //     expect(result[0].params[0]).to.equal("Test");
    //     expect(result[0].params[1]).to.equal(2);
    //     expect(result[0].params[2]).to.equal(false);
    //     expect(result[0].query).to.equal("SELECT cli.internalKey AS internalKey, cli.codeImport AS codeImport, cli.razaoSocial AS razaoSocial, cli.apelido AS apelido, cli.desativo AS desativo, cli.cidade_codeImport AS cidade_codeImport, cli.classificacao_codeImport AS classificacao_codeImport FROM Cliente AS cli WHERE cli.apelido = ? AND cli.id > ? AND cli.desativo <> ?");
    // });
});
