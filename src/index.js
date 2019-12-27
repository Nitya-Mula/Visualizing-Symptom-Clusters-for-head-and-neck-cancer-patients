import * as d3 from "d3";
import $ from 'jquery';
import _ from 'lodash';
window.$ = window.jQuery = $;
require('fomantic-ui-css/semantic');
require('fomantic-ui-css/semantic.min.css');

import TimeSlider from './timeslider';
import ScatterPlot from './scatterplot';
import StackedLinePlot from './stackedLinePlot';
import TendrilPlot from './tendrilplot';
import CorrelationMatrix from './correlationmatrix';
import PatientHistory from './patientHistory';
import StarPlot from "./starplot";


class App {
  constructor() {
    this.scatterPlot = null;
    this.stackPlot = null;
    this.sliderUpdate = this.sliderUpdate.bind(this);
    this.patientHistory = null;
    this.onPatientSelect = this.onPatientSelect.bind(this);
    this.showStackPlot = this.showStackPlot.bind(this);
    this.showPatientHistory = this.showPatientHistory.bind(this);
    this.onSymptomsSelect = this.onSymptomsSelect.bind(this);
    this.patients = [];
    this.symptoms = [];
    this.selectPatient = this.selectPatient.bind(this);
    this.symptoms = ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress',
      'shortnessOfBreath', 'memory', 'lackOfAppetite', 'drowsiness', 'dryMouth', 'sadness',
      'vomit', 'numbness', 'mucusInMouthAndThroat', 'difficultyInSwallowing', 'choking',
      'speech', 'skinPain', 'constipation', 'taste', 'sores', 'teethProblem',
      'generalActivity', 'mood', 'work', 'relations', 'walking', 'enjoymentOfLife'];
    this.allSymptoms = [...this.symptoms];
    this.symptoms = ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress'];
  }

  async initTimeSlider() {
    const symptoms = await d3.csv('/data/datasets/symptoms_period.csv');
    const timePeriods = _.sortedUniq(
      symptoms.map(({ period }) => parseInt(period, 10)).sort((a, b) => a - b));
    const timeSlider = new TimeSlider('#time-slider', timePeriods, this.sliderUpdate);
    timeSlider.init();
  }

  init() {
    this.initTimeSlider();
    this.showStackPlot(0);
    this.drawTendrilPlot();
    this.showPatientHistory(0);


    $('#patient-list').dropdown({
      maxSelections: 3,
      action: 'activate',
      onChange: this.onPatientSelect,
    });

    $('#symptoms-list').dropdown({
      maxSelections: 5,
      action: 'activate',
      onChange: this.onSymptomsSelect,
    });

    // Connecting tab event listeners
    $('#scatterplot-btn').on('click', function () {
      $('#scatterplot-btn').toggleClass('active');
      $('#correlation-btn').toggleClass('active');
      $('#scatterplot').show();
      $('#scales').show();
      $('#star-plot').hide();
      $('#matrix').hide();
      $('#patient-history').show();
      $('#infoButton').show();
      $('#defaultPatientText').show();
      if (this.patients = 'undefined' || this.patients.length == 0) {
        $('#defaultPatientText').hide();
      }
      $('#star-plot').hide();
    });

    $('#correlation-btn').on('click', function () {
      $('#scatterplot-btn').toggleClass('active');
      $('#correlation-btn').toggleClass('active');
      $('#scatterplot').hide();
      $('#matrix').show();
      $('#patient-history').hide();
      $('#infoButton').hide();
      $('#scales').hide();
      $('#defaultPatientText').hide();
      $('#star-plot').show();
    });

    $('#mult-symptoms-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').show();
      $('#stack').show();
      $('#patient-info').hide();
    });

    $('#mult-patients-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').hide();
      $('#stack').hide();
      // $('#defaultPatientText').hide();

    });

    $('#mult-timestamps-btn').on('click', function () {
      $('#mult-symptoms-btn').toggleClass('active');
      $('#mult-patients-btn').toggleClass('active');
      $('#tendril').hide();
      $('#stack').hide();
    });

    this.updateSymptoms();
    if (this.patients.length == 0) {
      $('#defaultPatientText').show();
    }
    else {
      $('#defaultPatientText').hide();
    }
  }

  async onPatientSelect(value) {
    this.highlightPatients(value);
    this.patients = value;
    this.stackPlot.clear();
    this.stackPlot.update(value, ['pain', 'fatigue', 'nausea', 'disturbedSleep', 'distress']);
    //this.showPatientHistory(this.patients[this.patients.length-1]);
    this.patientHistory.clear();
    if (this.patients.length === 0) {
      $('#defaultPatientText').show();
    } else {
      this.patientHistory.update(this.patients[this.patients.length - 1]);
      $('#defaultPatientText').hide();
    }
    this.drawTendrilPlot(this.patients, this.symptoms);
    this.drawStarPlots(this.patients[this.patients.length - 1], window.currentPeriod);
  }

  async onSymptomsSelect(value) {
    this.stackPlot.clear();
    this.stackPlot.update(this.patients, value);
    this.symptoms = value;
    this.drawTendrilPlot(this.patients, value);
  }

  async loadDataset(period) {
    const patients = await d3.csv('/data/datasets/patients_complete.csv');
    const clusters = await d3.csv(`/data/output/raw_result-time-${period}.csv`);
    const data = clusters
      .filter(cluster => patients.find(patient => patient.patientId === cluster.patientId))
      .map(cluster => ({ ...cluster, ...patients.find(patient => patient.patientId === cluster.patientId) }))
      .sort((a, b) => a.cluster - b.cluster)
      .map(({ cluster, gender, patientId, t_category }) => ({
        cluster: parseInt(cluster),
        patientId,
        gender,
        t_category,
      }));
    return data;
  }

  async updatePatientIds(ids) {
    // $('.ui.dropdown:has(#patient-list)').hide();
    $('.ui.dropdown:has(#patient-list) .default.text')
      .text(`Select Patient ID(s) - Total Count: ${ids.size}`);
    const selectEl = $('#patient-list');
    selectEl.empty();
    ids.forEach((id) => {
      const optionEl = $('<option></option>', { value: id });
      optionEl.text(id);
      selectEl.append(optionEl);
    })
  }

  async updateSymptoms() {
    $('.ui.dropdown:has(#symptoms-list) .default.text').text(`Select Symptom(s)`)
    const selectEl = $('#symptoms-list');
    selectEl.empty();
    this.allSymptoms.forEach((i) => {
      const optionEl = $('<option></option>', { value: i });
      optionEl.text(i);
      selectEl.append(optionEl);
    })
  }

  async sliderUpdate(period) {
    await this.drawClusters(period);
    await this.drawStarPlots(this.patients[this.patients.length - 1], period);
    if (this.patients && this.patients.length > 0) {
      this.highlightPatients(this.patients);
    }
    const matrixData = await d3.csv(`/data/output/correlation/${period}.csv`);
    if (!this.correlationMatrix && matrixData.length > 0) {
      this.correlationMatrix = new CorrelationMatrix('#matrix', 512, 512, matrixData);
      this.correlationMatrix.init();
    } else {
      this.correlationMatrix.clear();
      this.correlationMatrix.update(matrixData);
    }
  }

  async drawClusters(period) {
    const data = await this.loadDataset(period);
    const patientIds = data.map(({ patientId }) => parseInt(patientId));

    if (!this.scatterPlot && data.length > 0) {
      this.scatterPlot = new ScatterPlot('#scatterplot', 512, 512, data, this.selectPatient);
      this.scatterPlot.init();
    } else if (this.scatterPlot) {
      this.scatterPlot.clear();
      this.scatterPlot.update(data);
    }
    this.updatePatientIds(new Set(patientIds));
  }

  async selectPatient(value) {
    this.patientId = value;
    this.patients = value;
    this.stackPlot.clear();
    this.stackPlot.update(value, this.symptoms);
    this.drawTendrilPlot(this.patients, this.symptoms);
    this.patientHistory.clear();
    this.patientHistory.update(this.patients[this.patients.length - 1]);
    $('#defaultPatientText').hide();
  }

  async drawStarPlots(patientId, currPeriod) {
    if (this.starPlots)
      this.starPlots.forEach(plot => plot.container.remove());

    if (!patientId) {
      d3.select('#matrix .correlation')
        .classed('correlation-full', true);
      return;
    }
    d3.select('#matrix .correlation')
      .classed('correlation-full', false);

    currPeriod = currPeriod === 0 ? 6 : currPeriod === 25 ? 24 : currPeriod;
    const nextPeriod = currPeriod === 24 ? 25 : currPeriod + 6;
    const prevPeriod = currPeriod - 6;
    const timestamps = [prevPeriod, currPeriod, nextPeriod];

    const data = await d3.csv('/data/datasets/symptoms_period.csv');
    const patient = data.filter(p => p.patientId === patientId);
    this.starPlots = this.allSymptoms.map(symptom => {
      const data = { patient, symptom, timestamps };
      const starPlot = new StarPlot('#matrix', 120, 120, data);
      starPlot.init();
      return starPlot;
    });
  }

  async drawTendrilPlot(patientIds, symptoms) {
    $('#tendril-note').remove();
    if (this.tendrilPlots)
      this.tendrilPlots.forEach(plot => plot.svg.remove());

    if (!patientIds || patientIds.length === 0) {
      d3.select('#tendril')
        .append('p')
        .attr('id', 'tendril-note')
        .style('color', 'black')
        .text('Please select a patient.');
      return;
    }

    if (!symptoms || symptoms.length === 0) {
      d3.select('#tendril')
        .append('p')
        .attr('id', 'tendril-note')
        .style('color', 'black')
        .text('Select symptoms from dropdown to show tendril plot.');
      return;
    }

    $('#tendril-note').remove();

    const data = await d3.csv('/data/datasets/symptoms_period.csv');
    const patients = patientIds.map(patientId => data.filter(d => d.patientId === patientId));

    this.tendrilPlots = [];
    patients.forEach(patient => {
      const patientData = { patient, symptoms };
      const tendrilPlot = new TendrilPlot('#tendril', 150, 150, patientData);
      tendrilPlot.init();
      this.tendrilPlots.push(tendrilPlot);
    });
  }

  async showStackPlot(patientId) {
    const patientInfo = await d3.csv('/data/datasets/symptoms_period.csv');
    this.stackPlot = new StackedLinePlot(patientInfo, patientId);
    this.stackPlot.init();
  }

  async showPatientHistory(patientId) {
    const patientInfo = await d3.csv('/data/datasets/symptoms_period.csv');
    this.patientHistory = new PatientHistory(patientInfo, this.patients[this.patients.length - 1], this.allSymptoms);
    this.patientHistory.init();
  }

  async highlightPatients(patientIds) {
    if (!this.scatterPlot) return;
    this.scatterPlot.highlight(patientIds);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
