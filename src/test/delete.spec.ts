import { Delete } from "./../crud/delete/delete";
import { Classificacao } from "./models/classificacao";
import { expect } from "chai";

describe("Delete", () => {

    it("Classificacao", () => {
        const result = new Delete(Classificacao)
            .where(where => where.great(x => x.codeImport, 10))
            .compile();
        expect(result.params.length).to.equal(1);
        expect(result.params[0]).to.equal(10);
        expect(result.query).to.equal("DELETE FROM Classificacao WHERE codeImport > ?");
    });

});
