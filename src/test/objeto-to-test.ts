import { GuidClazz } from "./models/guid-clazz";
import { TestClazzRefCode } from "./models/test-clazz-ref-code";
import { TestClazzRef } from "./models/test-clazz-ref";
import { TestClazz } from "./models/test-clazz";
import { CondicaoPagamento } from "./models/condicao-pagamento";
import { Marca } from "./models/marca";
import { Pedido } from "./models/pedido";
import { Classificacao } from "./models/classificacao";
import { Regiao } from "./models/regiao";
import { SubRegiao } from "./models/sub-regiao";
import { Uf } from "./models/uf";
import { Cidade } from "./models/cidade";
import { Cliente } from "./models/cliente";
import * as moment from "moment";
import { ContasReceber } from "./models/contas-receber";
import { HeaderSimple } from "./models/header-simple";
import { Referencia } from "./models/referencia";
import { Imagem } from "./models/imagem";

export class ObjectToTest {

    public static classificacao = {
        codeImport: 0,
        descricao: "Top"
    } as Classificacao;

    public static regiao = {
        codeImport: 5,
        nome: "Sul"
    } as Regiao;

    public static subRegiao = {
        codeImport: 4,
        nome: "Sub Região",
        regiao: ObjectToTest.regiao
    } as SubRegiao;

    public static uf = {
        codeImport: "SC",
        nome: "Santa Catarina",
        population: 100
    } as Uf;

    public static cidade = {
        codeImport: 2,
        nome: "São Pedro",
        uf: ObjectToTest.uf,
        subRegiao: ObjectToTest.subRegiao,
    } as Cidade;

    public static cliente = {
        codeImport: 1,
        razaoSocial: "Razão",
        apelido: "Apelido",
        cidade: ObjectToTest.cidade,
        classificacao: ObjectToTest.classificacao,
        desativo: false
    } as Cliente;

    public static marca = {
        codeImport: 23,
        descricao: "Marca 23"
    } as Marca;

    public static condicaoPagamento = {
        codeImport: 25,
        nome: "Condicao Pagamento 25"
    } as CondicaoPagamento;

    public static pedido = {
        codeImport: 67,
        cliente: ObjectToTest.cliente,
        marca: ObjectToTest.marca,
        condicaoPagamento: ObjectToTest.condicaoPagamento
    } as Pedido;

    public static guidClazz = {
        // guid: "hdasjhas",
        description: "Condicao Pagamento 25"
    } as GuidClazz;

    public static testClazzRefCode = {
        code: "hdasjhas",
        description: "Test AD",
        reference: {
            id: 39,
            description: "abc"
        } as TestClazzRef
    } as TestClazzRefCode;

    public static testClazz = {
        internalKey: 1,
        id: 2,
        description: "Abdfa",
        referenceTest: {
            id: 3,
            description: "jhjhj"
        } as TestClazzRef,
        disabled: false,
        date: 23245456,
        dateMoment: moment(),
        dateDate: new Date(),
        numero: 134,
        referenceTestCode: {
            code: "3455ds",
            description: "jgagdada"
        } as TestClazzRefCode
    } as TestClazz;

    public static contasReceber = {
        codeImport: 10,
        valor: 1023.45,
        cliente: ObjectToTest.cliente,
        dataRecebimento: void 0,
        dataVencimento: moment()
    } as ContasReceber;

    public static headerSimple = {
        descricao: "Header Test",
        items: ["abc", "def", "ghi"]
    } as HeaderSimple;

    public static referencia = {
        codeImport: 20,
        codigo: "abcCode",
        descricao: "Referencia Test",
        restricaoGrade: ["31", "32", "33", "34", "35"],
        referenciasRelacionadas: [
            {
                codeImport: 21
            } as Referencia,
            {
                codeImport: 23
            } as Referencia,
            {
                codeImport: 25
            } as Referencia,
            {
                codeImport: 27
            } as Referencia,
        ],
        imagem: {
            internalKey: 30,
            data: "isso é uma imagem"
        } as Imagem,
        deleted: false
    } as Referencia;
}
