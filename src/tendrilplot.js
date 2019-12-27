import * as d3 from 'd3';

class TendrilPlot {
  constructor(selector, width, height, data) {
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.data = data;
  }

  init() {
    const { data, width, height } = this;
    d3.select(this.selector)
      .attr('title', 'This plot shows how the selected symptom ratings change over time. ' + 
        'Each circle represents one time stamp and they all map out from the center.' + 
        'Clockwise direction change indicates rating increase and vice versa.');

    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", `0 0 ${width}, ${height}`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr('preserveAspectRatio', "xMidYMid meet");

    this.patientIdEl = this.svg
      .append('text')
      .classed('patientTitle', true)
      .attr('font-size', 8)
      .attr('transform', `translate(${width / 2},12)`);
    this.drawTendrils(data);
  }

  clear() {
    this.svg.select('.tendrils').remove();
  }

  drawTendrils(data) {
    const { svg, height, width } = this;
    const { patient, symptoms } = data;
    const timestamps = patient.map(p => parseInt(p.period));
    const radiusScale = d3.scaleLinear()
      .domain(d3.extent(timestamps))
      .range([10, 50]);
    const angleScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, 2 * Math.PI]);
    const colors = ['green', 'red', 'blue', 'orange', 'purple'];
    const colorScale = d3.scaleOrdinal(colors);

    const line = d3.lineRadial()
      .curve(d3.curveCardinal);

    this.patientIdEl.text(`Patient ${patient[0].patientId}`);

    const g = svg.append('g')
      .classed('tendrils', true)
      .attr('transform', `translate(${width / 2},${height / 2})`);

    symptoms.forEach((symptom, i) => {
      const radialData = patient
        .map(p => ({
          [symptom]: parseInt(p[symptom]),
          period: parseInt(p.period),
        })).map(p => {
          return [angleScale(p[symptom]), radiusScale(p.period)];
        });

      radialData.unshift([0, 0]);
      const path = line(radialData);
      g.append('path')
        .attr('d', path)
        .attr('fill', 'none')
        .attr('stroke', colorScale(i))
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 0.5)
        .classed(symptom, true);

      radialData.slice(1, radialData.length)
        .forEach(([angle, r]) => {
          const x = r * Math.sin(angle);
          const y = r * -Math.cos(angle);
          g.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 2)
            .attr('fill-opacity', 0.45)
            .attr('fill', colorScale(i));
        });
    });
  }
}

export default TendrilPlot;
