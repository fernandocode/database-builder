import { TestClazzRef } from "./models/test-clazz-ref";
import { RowResult } from "../core/row-result";
import { expect } from "chai";
import { TestClazz } from "./models/test-clazz";
import * as moment from "moment";
import { FieldType } from "../core/enums/field-type";
import { MappersTableNew } from "./mappers-table-new";

describe("Row Result", () => {

    it("Simple", () => {
        const model = {
            id: 1,
            name: "Abc",
            test: true,
            age: 0,
            d: new Date()
        };

        const rowResult = new RowResult(model);
        expect(rowResult.get(x => x.name)).to.equal(model.name);
        expect(rowResult.get(x => x.id)).to.equal(model.id);
        expect(rowResult.get(x => x.test)).to.equal(model.test);
        expect(rowResult.get("ttt")).to.equal(void 0);
        expect(rowResult.coalesce("ttt", 123)).to.equal(123);
        expect(rowResult.coalesce(x => x.age, 123)).to.equal(model.age);
        expect(rowResult.coalesce(x => x.d, new Date())).to.equal(model.d);
    });

    it("With Mapper", () => {

        const mapper = new MappersTableNew();

        const defaultMoment = moment.utc();

        const model: any = {};
        model.id = 1;
        model.description = "Abc";
        model.disabled = true;
        model.numero = 10;
        model.dateMoment = defaultMoment.unix();
        model.dateDate = void 0;
        model.date = 1;
        model.referenceTest = new TestClazzRef();

        const rowResult = new RowResult(model, mapper.getThrowErrorNotFound(TestClazz).mapperTable);
        expect(rowResult.get(x => x.description)).to.equal(model.description);
        expect(rowResult.get(x => x.id)).to.equal(model.id);
        expect(rowResult.get(x => x.disabled)).to.equal(model.disabled);
        expect(rowResult.get("ttt")).to.equal(void 0);
        expect(rowResult.coalesce("ttt", 123)).to.equal(123);
        expect(rowResult.coalesce(x => x.numero, 123)).to.equal(model.numero);
        expect(rowResult.get(x => x.dateDate)).to.equal(model.dateDate);
        expect(rowResult.get(x => x.dateMoment)).to.equal(defaultMoment.unix());
        expect(rowResult.autoParse(x => x.dateMoment).format("DD/MM/YYYY")).to.equal(defaultMoment.format("DD/MM/YYYY"));
        expect(rowResult.parse(x => x.dateMoment, FieldType.DATE).format("DD/MM/YYYY")).to.equal(defaultMoment.format("DD/MM/YYYY"));
        const defaultDate = new Date();
        expect(rowResult.coalesce(x => x.dateDate, defaultDate)).to.equal(defaultDate);
    });

});
