import { RowResult } from "./../core/row-result";
import { expect } from "chai";

describe("Row Result", () => {

    it("Simple", () => {
        const model = {
            id: 1,
            name: "Abc",
            test: true,
            age: 0
        };

        const rowResult = new RowResult(model);
        expect(rowResult.get(x => x.name)).to.equal(model.name);
        expect(rowResult.get(x => x.id)).to.equal(model.id);
        expect(rowResult.get(x => x.test)).to.equal(model.test);
        expect(rowResult.get("ttt")).to.equal(void 0);
        expect(rowResult.coalesce("ttt", 123)).to.equal(123);
        expect(rowResult.coalesce(x => x.age, 123)).to.equal(model.age);
    });

});
