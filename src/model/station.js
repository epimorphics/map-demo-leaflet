import _ from 'lodash';

class Station {
  constructor(json) {
    this.json = json;
  }

  riverName() {
    return this.get('riverName');
  }

  lat() {
    return this.get('lat');
  }

  long() {
    return this.get('long');
  }

  reference() {
    return this.get('stationReference');
  }

  measure() {
    let measures = [];
    if (this.get('measures')) {
      measures = this.get('measures');
    }
    return measures;
  }

  get(path) {
    return _.get(this.json, path);
  }
}

export { Station as default };
