// import { Pedido } from "./models/pedido";
// import { CondicaoPagamento } from "./models/condicao-pagamento";
// import { Marca } from "./models/marca";
// import { TestClazzList } from "./models/test-clazz-list";
// import { DatabaseBuilderError } from "../core/errors";
// import { Regiao } from "./models/regiao";
// import { SubRegiao } from "./models/sub-regiao";
// import { Uf } from "./models/uf";
// import { Cidade } from "./models/cidade";
// import { Cliente } from "./models/cliente";
// import { MetadataTable } from "../metadata-table";
// import { Classificacao } from "./models/classificacao";
// import { DatabaseHelper } from "../database-helper";
// import { GetMapper } from "..";
// import { TestClazz } from "./models/test-clazz";
// import { TestClazzRef } from "./models/test-clazz-ref";
// import { TestClazzCompositeId } from "./models/test-clazz-composite-id";

// export class MappersTable implements GetMapper {

//     private _databaseHelper: DatabaseHelper = new DatabaseHelper();

//     // tslint:disable-next-line:member-ordering
//     public classificacaoMapper =
//         new MetadataTable(Classificacao, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public clienteMapper =
//         new MetadataTable(Cliente, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .mapper(x => x.cidade.codeImport)
//             .mapper(x => x.classificacao.codeImport)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public cidadeMapper =
//         new MetadataTable(Cidade, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .mapper(x => x.uf.codeImport)
//             .mapper(x => x.subRegiao.codeImport)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public ufMapper =
//         new MetadataTable(Uf, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public subRegiaoMapper =
//         new MetadataTable(SubRegiao, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public regiaoMapper =
//         new MetadataTable(Regiao, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public marcaMapper =
//         new MetadataTable(Marca, this._databaseHelper)
//             .key(x => x.internalKey)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public condicaoPagamentoMapper =
//         new MetadataTable(CondicaoPagamento, this._databaseHelper)
//             .key(x => x.internalKey)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public pedidoMapper =
//         new MetadataTable(Pedido, this._databaseHelper)
//             .key(x => x.internalKey)
//             .mapper(x => x.cliente.internalKey)
//             .mapper(x => x.cliente.codeImport)
//             .autoMapper(false, true, false);

//     // tslint:disable-next-line:member-ordering
//     public testClazzMapper =
//         new MetadataTable(TestClazz, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .mapper(x => x.referenceTestCode.code)
//             .autoMapper(false, true, false);
//     // tslint:disable-next-line:member-ordering
//     public testClazzRefMapper =
//         new MetadataTable(TestClazzRef, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .autoMapper(false, true, false);

//     // tslint:disable-next-line:member-ordering
//     public testClazzListMapper =
//         new MetadataTable(TestClazzList, this._databaseHelper)
//             .key(x => x.internalKey, true)
//             .autoMapper(false, true, false);

//     // tslint:disable-next-line:member-ordering
//     public testClazzCompositeIdMapper =
//         new MetadataTable(TestClazzCompositeId, this._databaseHelper, false)
//             .key(x => x.key1)
//             .key(x => x.key2)
//             .autoMapper(false, true, false);

//     private _mappersKeyValue: Map<string, MetadataTable<any>> = new Map([
//         this.createEntry(this.classificacaoMapper),
//         this.createEntry(this.print(this.clienteMapper)),
//         this.createEntry(this.cidadeMapper),
//         this.createEntry(this.ufMapper),
//         this.createEntry(this.subRegiaoMapper),
//         this.createEntry(this.regiaoMapper),
//         this.createEntry(this.testClazzMapper),
//         this.createEntry(this.testClazzRefMapper),
//         this.createEntry(this.testClazzListMapper),
//         this.createEntry(this.testClazzCompositeIdMapper),
//     ]);

//     private createEntry(metadataTable: MetadataTable<any>): [string, MetadataTable<any>] {
//         return [metadataTable.instance.constructor.name, metadataTable];
//     }

//     private print<T>(t: MetadataTable<T>): MetadataTable<T> {
//         // console.log(t.instance);
//         // console.log(t.mapperTable.columns.map(x => x.column).join(","));
//         return t;
//     }
// }
