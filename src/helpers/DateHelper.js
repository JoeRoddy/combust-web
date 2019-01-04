import moment from "moment";

export function formatDate(date) {
  //returns 12:00 PM, Jan 1st 12:00 PM, or Jan 1st, 1970 12:00 PM depending on recency
  const wasSentToday = !moment(date).isBefore(moment(), "day");
  const wasSentThisYear = !moment(date).isBefore(moment(), "year");
  let format =
    (!wasSentToday ? "MMM Do" : "") +
    (!wasSentThisYear ? ", YYYY " : "") +
    " h:mm A";
  return moment(date).format(format);
}
