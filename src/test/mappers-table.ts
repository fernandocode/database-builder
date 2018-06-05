import { TestClazzList } from "./models/test-clazz-list";
import { DatabaseBuilderError } from "./../core/errors";
import { Regiao } from "./models/regiao";
import { SubRegiao } from "./models/sub-regiao";
import { Uf } from "./models/uf";
import { Cidade } from "./models/cidade";
import { Cliente } from "./models/cliente";
import { MetadataTable } from "./../metadata-table";
import { Classificacao } from "./models/classificacao";
import { DatabaseHelper } from "./../database-helper";
import { GetMapper } from "../index";
import { TestClazz } from "./models/test-clazz";
import { TestClazzRef } from "./models/test-clazz-ref";

export class MappersTable implements GetMapper {

    private _databaseHelper: DatabaseHelper = new DatabaseHelper();

    // tslint:disable-next-line:member-ordering
    public classificacaoMapper =
        new MetadataTable(Classificacao, this._databaseHelper)
            .autoMapper(false, true, false);
    // tslint:disable-next-line:member-ordering
    public clienteMapper =
        new MetadataTable(Cliente, this._databaseHelper)
            .autoMapper(false, true, false);
    // tslint:disable-next-line:member-ordering
    public cidadeMapper =
        new MetadataTable(Cidade, this._databaseHelper)
            .autoMapper(false, true, false);
    // tslint:disable-next-line:member-ordering
    public ufMapper =
        new MetadataTable(Uf, this._databaseHelper)
            .autoMapper(false, true, false);
    // tslint:disable-next-line:member-ordering
    public subRegiaoMapper =
        new MetadataTable(SubRegiao, this._databaseHelper)
            .autoMapper(false, true, false);
    // tslint:disable-next-line:member-ordering
    public regiaoMapper =
        new MetadataTable(Regiao, this._databaseHelper)
            .autoMapper(false, true, false);

    // tslint:disable-next-line:member-ordering
    public testClazzMapper =
        new MetadataTable(TestClazz, this._databaseHelper)
            .autoMapper(false, true, false);
    // tslint:disable-next-line:member-ordering
    public testClazzRefMapper =
        new MetadataTable(TestClazzRef, this._databaseHelper)
            .autoMapper(false, true, false);

    // tslint:disable-next-line:member-ordering
    public testClazzListMapper =
        new MetadataTable(TestClazzList, this._databaseHelper)
            .autoMapper(false, true, false);

    private _mappersKeyValue: Map<string, MetadataTable<any>> = new Map([
        this.createEntry(this.classificacaoMapper),
        this.createEntry(this.clienteMapper),
        this.createEntry(this.cidadeMapper),
        this.createEntry(this.ufMapper),
        this.createEntry(this.subRegiaoMapper),
        this.createEntry(this.regiaoMapper),
        this.createEntry(this.testClazzMapper),
        this.createEntry(this.testClazzRefMapper),
        this.createEntry(this.testClazzListMapper),
    ]);

    /**
     * Find mapper metadata by key
     *
     * @public
     * @param {string} tKey
     * @returns {MetadataTable}
     * @memberof MappersTable
     */
    public getMapper<T>(tKey: new () => T): MetadataTable<T> {
        return this._mappersKeyValue.get(tKey.name);
    }

    public forEachMapper(
        callbackfn: (
            value: MetadataTable<any>,
            key: string,
            map: Map<string, MetadataTable<any>>
        ) => void,
        thisArg?: any
    ) {
        this._mappersKeyValue.forEach(callbackfn);
    }

    /**
     * Find mapper metadata by key and merge with new instance of data
     *
     * @param {string} tKey
     * @param {*} newInstance
     * @returns {MetadataTable}
     * @memberof MappersTable
     */
    public getMapperMerge<T>(tKey: new () => T, newInstance: any): MetadataTable<T> {
        const mapper = this.getMapper(tKey);
        if (!mapper) {
            throw new DatabaseBuilderError(`Mapper to ${tKey.name} not found!`);
        }
        const metadataCopy: MetadataTable<T> = Object.assign({}, mapper);
        metadataCopy.instance = Object.assign(metadataCopy.instance, newInstance);
        return metadataCopy;
    }

    private createEntry(metadataTable: MetadataTable<any>): [string, MetadataTable<any>] {
        return [metadataTable.instance.constructor.name, metadataTable];
    }
}
