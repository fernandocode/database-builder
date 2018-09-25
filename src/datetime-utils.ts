import * as moment from "moment";
import { DatabaseBuilderError } from "./core/errors";

export class DatetimeUtils {

    public static datetimeToDatabase(date: moment.Moment): number {
        if (date) {
            if (!date.unix) {
                throw new DatabaseBuilderError("Date format incorrect");
            }
            return date.unix();
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
