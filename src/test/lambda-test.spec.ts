import { Cliente } from "./models/cliente";
import { Query } from "./../crud/query/query";

import { expect } from "chai";

describe("Lambda Expression", () => {

    it("simple lambda", () => {
        const query = new Query(Cliente)
            .where(where => {
                // For test double equals
                // tslint:disable-next-line:triple-equals
                where.expression(x => x.apelido == "Test");
                where.equalValue(x => x.razaoSocial, "R");
            });
        const result = query.compile();
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("Test");
        expect(result.params[1]).to.equal("R");
        expect(result.query).to.equal("SELECT cli.* FROM Cliente AS cli WHERE cli.apelido = ? AND cli.razaoSocial = ?");
    });

    it("simple lambda with whereExp", () => {
        const result = new Query(Cliente)
            .whereExp(x => x.apelido === "Test")
            .whereExp(x => x.id > 10)
            .compile();
        expect(result.params.length).to.equal(2);
        expect(result.params[0]).to.equal("Test");
        expect(result.params[1]).to.equal(10);
        expect(result.query).to.equal("SELECT cli.* FROM Cliente AS cli WHERE cli.apelido = ? AND cli.id > ?");
    });

    it("lambda with ValueType's", () => {
        const result = new Query(Cliente)
            .where(where => {
                where
                    .expression(x => x.apelido === "Test")
                    .expression(x => x.id > 2)
                    .expression(x => x.desativo !== false)
                    ;
            })
            .compile();
        expect(result.params.length).to.equal(3);
        expect(result.params[0]).to.equal("Test");
        expect(result.params[1]).to.equal(2);
        expect(result.params[2]).to.equal(false);
        expect(result.query).to.equal("SELECT cli.* FROM Cliente AS cli WHERE cli.apelido = ? AND cli.id > ? AND cli.desativo <> ?");
    });

    // // Not work in lambda expression
    // it("lambda column vs variable", () => {
    //     let p1 = "Test";
    //     const result = new Query(Cliente)
    //     .where(where => {
    //         where
    //         .exp(x => x.apelido == p1)
    //         .exp(x => x.id > 2)
    //         .exp(x => x.desativo != false)
    //         ;
    //     })
    //     .compile();
    //     console.log(result);
    //     expect(result.params.length).to.equal(3);
    //     expect(result.params[0]).to.equal("Test");
    //     expect(result.params[1]).to.equal(2);
    //     expect(result.params[2]).to.equal(false);
    //     expect(result.query).to.equal("SELECT cli.* FROM Cliente AS cli WHERE cli.apelido = ? AND cli.id > ? AND cli.desativo <> ?");
    // });
});
