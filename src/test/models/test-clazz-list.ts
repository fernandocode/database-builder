import { TestClazzRef } from "./test-clazz-ref";

export class TestClazzList {
    public id: number = 0;
    public description: string = "";
    public list: TestClazzRef[] = [];
    public reference: TestClazzRef = new TestClazzRef();
}
