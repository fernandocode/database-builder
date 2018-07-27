import { TestClazzRef } from "./test-clazz-ref";
import { BaseKey } from "./base-key";

export class TestClazzList extends BaseKey {
    public id: number = 0;
    public description: string = "";
    public list: TestClazzRef[] = [];
    public reference: TestClazzRef = new TestClazzRef();
}
