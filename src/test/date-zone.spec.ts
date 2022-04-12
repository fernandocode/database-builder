import { expect } from "chai";
import { getMapper } from "./mappers-table-new";
import { ObjectToTest } from "./objeto-to-test";
import { ContasAReceber } from "./models/contas-a-receber";
import * as moment from "moment";
import { Crud } from "../crud";
import { SQLiteDatabase } from "./database/sqlite-database";
import { Ddl } from "../ddl";
import { DatetimeUtils } from "../datetime-utils";

describe("Date", () => {

    let _databaseInstance: { crud: Crud, ddl: Ddl };
    const databaseInstance = async () => {
        if (_databaseInstance) {
            return _databaseInstance;
        }
        const mapper = getMapper();

        const database = await new SQLiteDatabase().init();
        const crud = new Crud({ sqliteLimitVariables: 10000 }, { database, getMapper: mapper, enableLog: false });
        const ddl = new Ddl({ database, getMapper: mapper, enableLog: false });
        return _databaseInstance = { crud, ddl };
    };

    it("Datetime insert time zone utc", async () => {
        const database = await databaseInstance();
        const dataExample = {
            idErp: 11,
            valor: 1023.45,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: moment.utc()
        } as ContasAReceber;

        await database.ddl.create(ContasAReceber).execute().toPromise();
        const insert = database.crud.insert(ContasAReceber, { toSave: dataExample });
        const insertedResult = await insert.execute().toPromise();
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const dataResult = await database.crud.query(ContasAReceber)
            .where(w => w.equal(x => x.idErp, dataExample.idErp))
            .firstOrDefault().toPromise();
        expect(dataResult.dataVencimento.unix()).to.equal(dataExample.dataVencimento.unix());
        const dataResult2 = await database.crud.query(ContasAReceber)
            .where(w => w.equal(x => x.idErp, dataExample.idErp))
            .mapper<ContasAReceber>(rowResult => {
                return rowResult.read(ContasAReceber);
            }).toPromise();
        console.log(dataResult2);
        expect(dataResult2[0].dataVencimento.unix()).to.equal(dataExample.dataVencimento.unix());
    });

    it("Datetime insert time zone default", async () => {
        const database = await databaseInstance();
        const dataExample = {
            idErp: 12,
            valor: 1023.45,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: DatetimeUtils.datetimeIgnoreTimeZone(moment())
        } as ContasAReceber;

        await database.ddl.create(ContasAReceber).execute().toPromise();
        const insert = database.crud.insert(ContasAReceber, { toSave: dataExample });
        const insertedResult = await insert.execute().toPromise();
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const dataResult = await database.crud.query(ContasAReceber).where(w => w.equal(x => x.idErp, dataExample.idErp)).firstOrDefault().toPromise();
        expect(dataResult.dataVencimento.unix()).to.equal(dataExample.dataVencimento.unix());
    });

    it("Date insert time zone default", async () => {
        const database = await databaseInstance();
        const dataExample = {
            idErp: 13,
            valor: 1023.45,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: DatetimeUtils.datetimeToDate("2010-01-28T00:00:00-02:00")
        } as ContasAReceber;

        await database.ddl.create(ContasAReceber).execute().toPromise();
        const insert = database.crud.insert(ContasAReceber, { toSave: dataExample });
        const insertedResult = await insert.execute().toPromise();
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const dataResult = await database.crud.query(ContasAReceber).where(w => w.equal(x => x.idErp, dataExample.idErp)).firstOrDefault().toPromise();
        expect(dataResult.dataVencimento.unix()).to.equal(dataExample.dataVencimento.unix());
    });

    it("Date insert time zone", async () => {
        const database = await databaseInstance();
        const dataAgora = DatetimeUtils.now();
        const dataExample = {
            idErp: 14,
            valor: 1023.45,
            cliente: ObjectToTest.cliente,
            dataRecebimento: void 0,
            dataVencimento: dataAgora
        } as ContasAReceber;

        await database.ddl.create(ContasAReceber).execute().toPromise();
        const insert = database.crud.insert(ContasAReceber, { toSave: dataExample });
        const insertedResult = await insert.execute().toPromise();
        expect(insertedResult[0].rowsAffected).to.equal(1);

        const dataResult = await database.crud.query(ContasAReceber).where(w => w.equal(x => x.idErp, dataExample.idErp)).firstOrDefault().toPromise();
        expect(dataResult.dataVencimento.unix()).to.equal(dataExample.dataVencimento.unix());
    });

    it("Datetime Utils now()", () => {
        const momentAgora = moment();
        const momentNow = DatetimeUtils.now();
        const dataAgora = DatetimeUtils.datetimeIgnoreTimeZone(momentAgora);
        expect(dataAgora.unix()).to.equal(momentNow.unix());
    });
});
