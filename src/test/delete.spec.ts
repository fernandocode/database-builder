import { Delete } from "./../crud/delete/delete";
import { Classificacao } from "./models/classificacao";
import { expect } from "chai";

describe("Delete", () => {

    it("Classificacao", () => {
        const result = new Delete(Classificacao)
            .where(where => where.great(x => x.codeImport, 10))
            .compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].query).to.equal("DELETE FROM Classificacao WHERE codeImport > ?");
    });

});
