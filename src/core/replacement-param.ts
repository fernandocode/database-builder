export class ReplacementParam {

    public properties: string[];

    constructor(
        ...properties: string[]
    ) {
        this.properties = properties;
    }
}