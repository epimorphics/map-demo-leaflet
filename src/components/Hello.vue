<template>
  <div class="hello">
    <MapView ref="leaflet"></MapView>
    <DataForm @input="setData" ref="form"></DataForm>
    <timestamp @skipfwd="skipfwd"
               @skipback="skipback"
               @pause="pause"
               @play="play"
               :date="date"
               :time="time"
               ref="time">
    </timestamp>
  </div>
</template>

<script>
import MapView from './Map';
import DataForm from './DataForm';
import timestamp from './timestamp';
import DataModel from '../model/dataModel';

const moment = require('moment');

const dataModel = new DataModel();
const rainOptions = { color: 'blue', weight: 1 };
const tideOptions = {
  color: 'red',
  weight: 1,
  marker: { color: 'red', width: 10 },
};

function nearestQuarterHour() {
  const quarters = Math.floor(moment().minute() / 15) * 15;
  return moment().set('minute', quarters).format('HH-mm');
}

export default {
  name: 'hello',
  data() {
    return {
      date: moment().format('YYYY-MM-DD'),
      time: nearestQuarterHour(),
      flooding: true,
      rainfall: true,
      tide: true,
      latest: true,
      day: false,
    };
  },
  components: {
    MapView,
    timestamp,
    DataForm,
  },
  mounted() {
    this.checkdate();
  },
  watch: {
    date() {
      dataModel.getDate(this.date, this.getSelected());
    },
  },
  methods: {
    // Used to pass dataModel currently selected data types
    getSelected() {
      return {
        flooding: this.flooding,
        tide: this.tide,
        rainfall: this.rainfall,
      };
    },
    // Called when dataForm emits an input event, updates selected data types
    setData(formData) {
      this.flooding = formData.flooding;
      this.rainfall = formData.rainfall;
      this.tide = formData.tide;
      this.latest = false;
      this.day = true;
      this.pause();
      const datePromises = dataModel.getDate(formData.date, this.getSelected());
      this.$refs.form.toggleLoad(this.getSelected());
      Object.keys(datePromises).map(key =>
        datePromises[key].promise.then((out) => {
          let done = 0;
          const total = out.total;
          out.completionPromise.then(() => {
            const loadObj = {};
            loadObj[datePromises[key].type] = true;
            this.$refs.form.toggleLoad(loadObj);
            this.time = '00-00';
            this.date = formData.date;
            this.play();
            this.checkdate();
            return null;
          })
            .catch(() => {
              const loadObj = {};
              loadObj[datePromises[key].type] = 'fail';
              this.$refs.form.toggleLoad(loadObj);
            });
          out.pagePromises.map(promise =>
            promise.then(() => {
              done += 1;
              const loadObj = {};
              loadObj[datePromises[key].type] = done / total;
              this.$refs.form.loadingPercent(loadObj);
            }));
        }),
      );
    },
    play() {
      this.$refs.time.setStart();
      if (!this.intervalId) {
        this.intervalId = window.setInterval(() => {
          this.date = moment(this.date, 'YYYY-MM-DD').format('YYYY-MM-DD');
          this.time = moment(this.time, 'HH-mm')
            .add(15, 'minutes').format('HH-mm');
          this.checkdate(this.date, this.time);
          this.$refs.time.setStart();
        }, 50);
      }
    },
    pause() {
      this.intervalId = window.clearInterval(this.intervalId);
    },
    skipfwd() {
      this.time = moment(this.time, 'HH-mm')
        .add(15, 'minutes').format('HH-mm');
      this.checkdate();
    },
    skipback() {
      this.time = moment(this.time, 'HH-mm')
        .subtract(15, 'minutes').format('HH-mm');
      this.checkdate();
    },
    checkdate() {
      let valuePromises;
      if (this.latest) {
        valuePromises = dataModel.getLatest(this.getSelected());
      } else if (this.day) {
        valuePromises =
          dataModel.getAPIPoint(this.date, this.time, this.getSelected());
      }
      return valuePromises.then((values) => {
        const data = {
          rainData: { data: values.rainPoints, options: rainOptions },
          levelData: { data: values.levelPoints, options: {} },
          tideData: { data: values.tidePoints, options: tideOptions },
        };
        if (this.$refs) {
          this.$refs.leaflet.pointsUpdate(data);
        }
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.control {
  display: inline-block;
  height: 20px;
  font-size: 2em;
  color: green;
  margin: 0 10px;
}

.controlBox {
  background-color: #333333;
  color: green;
}

</style>
