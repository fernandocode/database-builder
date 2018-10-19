import { Classificacao } from "./models/classificacao";
import { expect } from "chai";
import { getMapper } from "./mappers-table-new";
import { Crud } from "../crud";

describe("Delete", () => {
    // const mapper = getMapper();
    const crud = new Crud({} as any, getMapper());

    it("Classificacao", () => {
        const result = crud.delete(Classificacao)
        // const result = new Delete(Classificacao, mapper.get(Classificacao).mapperTable)
            .where(where => where.great(x => x.codeImport, 10))
            .compile();
        expect(result[0].params.length).to.equal(1);
        expect(result[0].params[0]).to.equal(10);
        expect(result[0].query).to.equal("DELETE FROM Classificacao WHERE codeImport > ?");
    });

});
