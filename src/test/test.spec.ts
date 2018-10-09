import { expect } from "chai";
import { DatabaseResult } from "../definitions/database-definition";

describe("Test", () => {

    it("recursive method test", () => {
        const apply = (script: Script): Promise<DatabaseResult> => {
            return new Promise((resolve, reject) => {
                console.log(`Apply: ${script.sql} - params: ${script.params}`);
                resolve({
                    insertId: script.sql
                } as DatabaseResult);
            });
        };

        const checkParams = (script: Script, resultadosAnteriores: DatabaseResult[])
            : Script => {
            const paramsResult: any[] = [];
            script.params.forEach(param => {
                if (param instanceof ParamDependente) {
                    // const item = resultadosAnteriores[param.indexScriptResult];
                    let value = resultadosAnteriores as any;
                    param.propertyScriptResult.forEach(property => {
                        value = value[property];
                    });
                    paramsResult.push(value);
                } else {
                    paramsResult.push(param);
                }
            });
            script.params = paramsResult;
            return script;
        };

        const executorLinked = (
            scripts: Script[], resultadosAnteriores: DatabaseResult[]
        ): Promise<DatabaseResult[]> => {
            return new Promise((resolve, reject) => {
                if (scripts && scripts.length > 0) {
                    apply(checkParams(scripts[0], resultadosAnteriores))
                        .then(result => {
                            // remove o item executado
                            scripts.shift();
                            executorLinked(scripts, resultadosAnteriores.concat([result]))
                                .then(res => {
                                    resolve([result].concat(res));
                                })
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(err));
                } else {
                    resolve([]);
                }
            });
        };

        executorLinked([
            {
                sql: "s1 ?",
                params: [1]
            } as Script,
            {
                sql: "s2 ? ? ?",
                params: [1, "ab", new ParamDependente(0, "insertId")]
            } as Script,
            {
                sql: "s3",
                params: []
            } as Script,
            {
                sql: "s4",
                params: ["?marcio", new ParamDependente(2, "insertId")]
            } as Script,
            {
                sql: "s5",
                params: [5]
            } as Script,
        ], []).then(result => {
            console.log(result);
        });
    });

});

interface Script {
    sql: string;
    params: any[];
}

class ParamDependente {

    public propertyScriptResult: Array<string | number>;

    constructor(
        // public indexScriptResult: number,
        ...propertyScriptResult: Array<string | number>
    ) {
        this.propertyScriptResult = propertyScriptResult;
    }
}