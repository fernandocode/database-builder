import { Regiao } from './models/regiao';
import { SubRegiao } from './models/sub-regiao';
import { Uf } from './models/uf';
import { Cidade } from './models/cidade';
import { Cliente } from './models/cliente';
import { MetadataTable } from './../metadata-table';
import { Classificacao } from './models/classificacao';
import { DatabaseHelper } from './../database-helper';
import { GetMapper } from "../index";


export class MappersTable implements GetMapper {

    private _databaseHelper: DatabaseHelper = new DatabaseHelper()

    
    public classificacaoMapper =
        new MetadataTable(Classificacao, this._databaseHelper)
            .autoMapper(false, true, false);
    public clienteMapper =
        new MetadataTable(Cliente, this._databaseHelper)
            .autoMapper(false, true, false);
    public cidadeMapper =
        new MetadataTable(Cidade, this._databaseHelper)
            .autoMapper(false, true, false);
    public ufMapper =
        new MetadataTable(Uf, this._databaseHelper)
            .autoMapper(false, true, false);
    public subRegiaoMapper =
        new MetadataTable(SubRegiao, this._databaseHelper)
            .autoMapper(false, true, false);
    public regiaoMapper =
        new MetadataTable(Regiao, this._databaseHelper)
            .autoMapper(false, true, false);

    private _mappersKeyValue: Map<string, MetadataTable<any>> = new Map([
        this.createEntry(this.classificacaoMapper),
        this.createEntry(this.clienteMapper),
        this.createEntry(this.cidadeMapper),
        this.createEntry(this.ufMapper),
        this.createEntry(this.subRegiaoMapper),
        this.createEntry(this.regiaoMapper),
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
    * */
    public getMapperMerge<T>(tKey: new () => T, newInstance: any): MetadataTable<T> {
        let mapper = this.getMapper(tKey);
        if (!mapper) {
            throw `Mapper to ${tKey.name} not found!`;
        }
        let metadataCopy: MetadataTable<T> = Object.assign({}, mapper);
        metadataCopy.instance = Object.assign(metadataCopy.instance, newInstance);
        return metadataCopy;
    }

    private createEntry(metadataTable: MetadataTable<any>): [string, MetadataTable<any>] {
        return [metadataTable.instance.constructor.name, metadataTable];
    }
}