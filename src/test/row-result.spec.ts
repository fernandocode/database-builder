import { RowResult } from "./../core/row-result";
import { expect } from "chai";
import { Query } from "..";
import { TestClazz } from "./models/test-clazz";
import { TestClazzRef } from "./models/test-clazz-ref";

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

    // it("Query", () => {
    //     const query = new Query(TestClazz);

    //     const model = {
    //         id: 1,
    //         description: "Descrição",
    //         referenceTest: {
    //             id: 2,
    //             description: "Referencia"
    //         } as TestClazzRef,
    //         disabled: false
    //     } as TestClazz;

    //     query.mapper((row: RowResult<any>) => {
    //         expect(row.get("description")).to.equal(model.description);
    //         expect(row.get(x => x.id)).to.equal(model.id);
    //         expect(row.get(x => x.test)).to.equal(model.test);
    //         expect(row.get("ttt")).to.equal(void 0);
    //         expect(row.coalesce("ttt", 123)).to.equal(123);
    //         expect(row.coalesce(x => x.age, 123)).to.equal(model.age);
    //     });
    // });

});
