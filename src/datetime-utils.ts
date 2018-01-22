import * as moment from "moment";

export class DatetimeUtils {

    public static datetimeToDatabase(date: moment.Moment): number {
        if (!date.unix) {
            throw new Error("Date format incorrect");
            // console.warn("Date format incorrect");
        }
        return date.unix();
    }

    public static dateToDatabase(date: any): number {
        return this.datetimeToDate(date).unix();
    }

    public static datetimeToDate(date: any): moment.Moment {
        return moment.utc(moment.utc(date).toISOString(), "YYYY-MM-DD");
    }

    public static databaseToDatetime(unix: number) {
        return moment.utc(unix * 1000);
    }
}
