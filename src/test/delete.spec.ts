import { Classificacao } from "./models/classificacao";
import { expect } from "chai";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";

describe("Delete", () => {
    const crud = new Crud({getMapper: getMapper()});

    it("Classificacao", () => {
        const result = crud.delete(Classificacao)
            .where(where => where.great(x => x.codeImport, 10))
            .compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].query).to.equal("DELETE FROM Classificacao WHERE codeImport > ?");
    });

});
