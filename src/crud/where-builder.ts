import { WhereBuilderContract } from "./where-builder-contract";
import { TypeWhere, Utils } from "../core/utils";
import { WhereBaseBuilder } from "./where-base-builder";
import { ColumnParams } from "../core/column-params";

// TODO: add LambdaExpression support in WhereBuilder
/**
 * TODO: Verificar possibilidade de dar suporte para ao invês de passar uma coluna
 * em formato string arbritaria utilizar keyof para permitir string com o nome das
 * propriedades, o que seria mais eficiente do que utilizar expression que teriam
 * que ser resolvidas em tempo de execução com manipulação de string e
 * ainda assim garantiria uma validação de nomes de porpriedades do typescript
 * assim como o que temos com expression hoje.
 * Teriamos que verificar se a refatoração de propriedades cobre keyof
 * link: https://stackoverflow.com/questions/50949905
 */

 /**
  * WhereBuilder
  */
export class WhereBuilder<T>
    extends WhereBaseBuilder<T, TypeWhere<T>, WhereBuilder<T>>
    implements WhereBuilderContract<T> {

    protected _getInstance(): WhereBuilder<T> {
        return this;
    }

    protected _create(typeT: new () => T, alias: string): WhereBuilder<T> {
        return new WhereBuilder(typeT, alias);
    }

    protected getColumnParams(expression: TypeWhere<T>): ColumnParams {
        return Utils.getColumnWhere(expression);
    }
}
