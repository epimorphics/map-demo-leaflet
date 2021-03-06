import _ from 'lodash';
import moment from 'moment';

export const READINGS_DATE_FORMAT = 'D MMM YYYY';

/** Encapsulate a reading from a station */
export class Reading {
  constructor(json) {
    this.jsonRef = json;
  }

  uri() {
    return this.get('@id');
  }

  value() {
    return this.get('value');
  }

  dateTimeStr() {
    return this.get('dateTime');
  }

  moment() {
    return moment(this.dateTimeStr()).format('YYYY-MM-DD HH-mm');
  }

  dateTime() {
    return moment(this.dateTimeStr()).utc();
  }

  measure() {
    return this.get('measure');
  }

  jsDate() {
    return this.dateTime().toDate();
  }

  get(path) {
    return _.get(this.jsonRef, path);
  }
}
