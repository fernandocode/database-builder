export interface DdlCompiled {
    script: string;
    dependencies: DdlCompiled[];
}