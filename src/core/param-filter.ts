export class ParamFilter {

    public static PATTERN = /:\{(.*?)\}/;

    public static builder(paramName: string): string {
        return `:{${paramName}}`;
    }
}