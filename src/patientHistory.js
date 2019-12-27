import * as d3 from 'd3';

class PatientHistory {
  constructor(data, patientId, symptoms) {
    this.data = data;
    this.patientId = patientId;
    this.symptoms = symptoms;
  }

  init() {
    this.drawPatientHistory(this.patientId);
  }



  async drawPatientHistory(patientId) {
    const patients = await d3.csv('/data/datasets/patients_complete.csv');
    var patientBackground = patients.find(p => p.patientId == this.patientId);
    var i = 0;
    var j = 0;
    const margin = {
      left: 0,
      right: 10,
      top: 10,
      bottom: 10
    };
    const width = 260;
    const height = 870;

    const periods = ["0M", "6M", "12M", "18M", "24M", ">24M"];
    const colors = ['#fff', '#fff5f0', '#d1c0c0', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d', '#4a1212'];
    var patient = this.data.filter(p => p.patientId == this.patientId);

    function transformRatingColor(r) {
      switch (r) {
        case 0:
          return '#bdbdbd';
        case 1:
          return '#d9d9d9';
        case 2:
          return '#fee0d2';
        case 3:
          return '#fcbba1';
        case 4:
          return '#fc9272';
        case 5:
          return '#fb6a4a';
        case 6:
          return '#ef3b2c';
        case 7:
          return '#cb181d';
        case 8:
          return '#a50f15';
        case 9:
          return '#67000d';
        case 10:
          return '#4a1212';
        default:
          return '#d9d9d9';
      }
    }



    this.svg = d3.select("#patient-info")
      .append('svg')
      .attr('class', 'patientSvg')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('font-size', 10)
      .attr("font-family", "sans-serif")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('width', 300)
      .attr('height', 1000)
      .style('display', 'none');

    this.g = this.svg.append('g')
      .attr('class', 'patientGroup')
      .attr('transform', `translate(0,0)`);

    for (i = 0; i < this.symptoms.length; i++) {
      this.g.append('text')
        .attr('class', 'symptomText')
        .attr('x', 135)
        .attr('y', height - 106 - 15 * i)
        .attr('color', 'black')
        .text(this.symptoms[i])
    }

    periods.forEach((p, i) => {
      this.g.append('text')
        .attr('class', 'periodText')
        .attr('x', 20 * i + margin.left)
        .attr('y', height - 90)
        .attr('color', 'black')
        .attr('font-size', '8')
        .text(p)
    });

    function transformPeriod(p) {
      switch (p) {
        case 0:
        case 6:
        case 12:
        case 18:
        case 24:
          return Math.round(p / 6);
        default:
          return 5;
      }
    }

    var symptoms_localdata = []
    var patients_localdata = []
    var text_tooltip = ''
    for (i = 0; i < 29; i++) {
      symptoms_localdata.push(this.symptoms[i]);
      for (j = 0; j < patient.length; j++) {
        patients_localdata.push(patient[j])
        this.g.append('rect')
          .attr('class', 'symptoms')
          .attr('x', 20 * transformPeriod(parseInt(patient[j].period)) + margin.left)
          .attr('y', height - 115 - 15 * i)
          .attr('height', 10)
          .attr('width', 15)
          .attr('fill', transformRatingColor(parseInt(patient[j][this.symptoms[i]])))
          .style("cursor", "pointer")
          .attr('opacity', '0.9')
          .append("title")
          .text(function () {
            var months = ''
            text_tooltip = 'Symptom: ' + symptoms_localdata[i] + '\n';
            text_tooltip = text_tooltip + 'Rating: ' + patients_localdata[j][symptoms_localdata[i]] + '\n' + 'Months: ';
            if (j == 0) {
              months = '0';
            } else if (j == 1) {
              months = '6';
            } else if (j == 2) {
              months = '12';
            } else if (j == 3) {
              months = '18';
            } else if (j == 4) {
              months = '24';
            } else {
              months = '25';
            }
            text_tooltip = text_tooltip + months;
            return text_tooltip;
          });
      }
    }

    this.g.append('text')
      .attr('class', 'patientTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '12px')
      .attr('transform', `translate(${margin.left},${margin.top + 242})`)
      .text("Patient " + this.patientId)

    if (!patientBackground) return;

    this.g.append('text')
      .attr('class', 'AgeTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 256})`)
      .text("Age: " + parseInt(patientBackground.age));

    this.g.append('text')
      .attr('class', 'GenderTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 268})`)
      .text("Gender: " + patientBackground.gender)

    this.g.append('text')
      .attr('class', 'TumorTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 280})`)
      .text("Tumor category: " + patientBackground.t_category)

    this.g.append('text')
      .attr('class', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 292})`)
      .text("Therapeutic combination: " + patientBackground.therapeutic_combination)

    this.g.append('text')
      .attr('class', 'DoseTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 304})`)
      .text("Total dose: " + patientBackground.total_dose)

    this.g.append('text')
      .attr('class', 'FractionTitle')
      .attr('id', 'patientTitle')
      .attr('font-size', '10px')
      .attr('transform', `translate(${margin.left},${margin.top + 316})`)
      .text("Total fractions: " + patientBackground.total_fractions)

  }

  clear() {
    this.svg.selectAll('.symptomText').remove();
    this.svg.selectAll('.periodText').remove();
    this.svg.selectAll('.symptoms').remove();
    this.svg.selectAll('.patientTitle').remove();
    this.svg.selectAll('.AgeTitle').remove();
    this.svg.selectAll('.TumorTitle').remove();
    this.svg.selectAll('.patientTitle').remove();
    this.svg.selectAll('.AgeTitle').remove();
    this.svg.selectAll('.DoseTitle').remove();
    this.svg.selectAll('.FractionTitle').remove();
    this.svg.selectAll('.GenderTitle').remove();
    this.svg.selectAll('.patientGroup').remove();
    d3.selectAll('.patientSvg').remove();
  }


  async update(patientId) {
    this.patientId = patientId;
    await this.drawPatientHistory(patientId);
    this.svg.style('display', 'block');
  }
}
export default PatientHistory;
