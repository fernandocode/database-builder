import * as moment from "moment";
import { DatabaseBuilderError } from "./core/errors";
import { Utils } from "./core/utils";

export class DatetimeUtils {

    public static datetimeToDatabase(date: moment.Moment | number): number {
        if (date) {
            if (Utils.isNumber(date)) {
                return date as number;
            }
            if (!(date as moment.Moment).unix) {
                throw new DatabaseBuilderError("Date format incorrect");
            }
            return (date as moment.Moment).unix();
        }
        return void 0;
    }

    public static dateToDatabase(date: any): number {
        return this.datetimeToDate(date).unix();
    }

    public static datetimeToDate(date: any): moment.Moment {
        return moment.utc(moment.utc(date).toISOString(), "YYYY-MM-DD");
    }

    public static databaseToDatetime(unix: number) {
        if (unix) {
            return moment.utc(unix * 1000);
        }
        return void 0;
    }
}
