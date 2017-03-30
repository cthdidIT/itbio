import moment from "moment";
import _ from "lodash";

moment.locale('sv');

const DATE_MONTH_TIME = "D MMM HH:mm";
const DATE_MONTH = "D MMMM";

const padWithZero = (s) => _.padStart(s, 2, '0');

const padAndJoinWith = (elems, joiner) =>
    elems.map(padWithZero).join(joiner);

const showingDateToString = (date, time = [0, 0, 0]) => {
    const dateString = padAndJoinWith(date, '-');
    const timeString = padAndJoinWith(_.take(time, 3), ':');
    return dateString + " " + timeString;
};

export const formatShowingDateTime = (date, time) =>
    moment(showingDateToString(date, time)).format(DATE_MONTH_TIME);

export const formatShowingDate = (date) =>
    moment(showingDateToString(date)).format(DATE_MONTH);