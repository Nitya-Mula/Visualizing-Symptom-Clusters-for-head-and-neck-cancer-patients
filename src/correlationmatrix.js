
import * as d3 from 'd3';

class CorrelationMatrix {
  constructor(selector, width, height, data) {
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.data = data;
    this.itemSize = 22;
    this.cellSize = this.itemSize - 3;
  }

  prepareData(data) {
    this.symptoms = data.columns.sort((a, b) => a.length - b.length);
    this.correlationData = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < Object.keys(data[i]).length; j++) {
        this.correlationData.push({
          row: i,
          col: j,
          value: parseFloat(data[i][this.symptoms[j]]),
        });
      }
    }
  }

  init() {
    const {
      data,
      width,
      height
    } = this;
    this.margin = {
      left: 30,
      bottom: 30
    };

    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height + 85)
      .attr("viewBox", `0 0 ${width}, ${height}`)
      .attr("font-size", 20)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .classed('correlation', true)
      .classed('correlation-full', true);

    this.tooltip = d3.select("body")
      .append("div")
      .style("width", "40px")
      .style("height", "24px")
      .style("background", "#fee0d2")
      .style("opacity", "1")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("box-shadow", "0px 0px 6px #7861A5")
      .style("padding", "4px")
      .attr('id', 'correlation-tooltip')
      .style('border-radius', '10px');

    this.toolval = this.tooltip.append('div');

    this.prepareData(data);

    this.xScale = d3.scaleBand()
      .rangeRound([0, width - this.margin.left])
      .domain(this.symptoms);
    this.yScale = d3.scaleBand()
      .rangeRound([0, height - this.margin.bottom])
      .domain(this.symptoms);
    this.colorScale = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(['#fc9272', '#fee0d2', '#de2d26']);
    this.radiusScale = d3.scaleSqrt()
      .domain([0, 1])
      .range([0, 0.5 * this.xScale.bandwidth()]);

    this.drawCells();
  }

  drawCells() {
    const cells = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left}, 0)`)
      .attr('id', 'cells')
      .selectAll('empty')
      .data(this.correlationData)
      .enter().append('g')
      .attr('class', 'cell')
      .style('pointer-events', 'all');

    cells.append('rect')
      .attr('x', d => this.xScale(this.symptoms[d.col]))
      .attr('y', d => this.yScale(this.symptoms[d.row]))
      .attr('width', d => d.col >= d.row ? 0 : this.xScale.bandwidth())
      .attr('height', d => d.col >= d.row ? 0 : this.yScale.bandwidth())
      .attr('fill', 'none')
      .attr('stroke', 'none')
      .attr('stroke-width', '1')

    cells.append('circle')
      .attr('cx', d => this.xScale(this.symptoms[d.col]) + 0.5 * this.xScale.bandwidth())
      .attr('cy', d => this.yScale(this.symptoms[d.row]) + 0.5 * this.yScale.bandwidth())
      .attr('r', d => d.col >= d.row ? 0 : this.radiusScale(Math.abs(d.value)))
      .style('fill', d => this.colorScale(d.value))
      .style('fill-opacity', 0.5);

    const {
      svg,
      toolval,
      tooltip,
      xScale,
      yScale,
      height,
      symptoms,
      margin
    } = this;
    svg.selectAll('g.cell')
      .on('mouseover', function (d) {
        d3.select(this)
          .select('rect')
          .attr('stroke', 'black');

        svg.append('text')
          .attr('class', 'correlation-label')
          .attr('x', margin.left + xScale(symptoms[d.col]))
          .attr('y', height - margin.bottom / 2)
          .text(symptoms[d.col])
          .attr('text-anchor', d.col <= symptoms.length / 2 ? 'start' : 'end')
          .style('font-size', '1em');

        svg.append('text')
          .attr('class', 'correlation-label')
          .attr('x', -15 - yScale(symptoms[d.row]))
          .attr('y', margin.left - 5)
          .attr('text-anchor', d.row > symptoms.length / 2 ? 'start' : 'end')
          .attr('dominant-baseline', 'middle')
          .attr('transform', 'rotate(-90)')
          .text(symptoms[d.row]);

        tooltip.style('visibility', 'visible')
          .style('left', `${d3.event.pageX + 20}px`)
          .style('top', `${d3.event.pageY - 20}px`);
        toolval.text(d3.format('.2f')(d.value));
      })
      .on('mouseout', function (d) {
        d3.select(this)
          .select('rect')
          .attr('stroke', 'none');
        d3.selectAll('.correlation-label').remove();
        d3.selectAll('#correlation-tooltip')
          .style('visibility', 'hidden');
      });
    var defs = d3.select(".correlation").append("defs");
    var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
    linearGradient
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", '#fc9272');
    linearGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", '#fee0d2');
    linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", '#de2d26')
    svg.append("rect")
      .attr("width", "90%")
      .attr("height", 7)
      .style("fill", "url(#linear-gradient)")
      .attr('x', 30)
      .attr('y', 510)
      .style("stroke", "lightgrey")

    d3.select(".correlation").append('circle')
      .attr('cx', "5%")
      .attr('cy', height + 33)
      .attr('r', "8.5")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("-1")
      .attr("x", "5%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "15.5%")
      .attr('cy', height + 33)
      .attr('r', "7.36")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("-0.75")
      .attr("x", "15.5%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "27%")
      .attr('cy', height + 33)
      .attr('r', "6")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("-0.5")
      .attr("x", "27%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "38.5%")
      .attr('cy', height + 33)
      .attr('r', "4.27")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("-0.25")
      .attr("x", "38.5%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "50%")
      .attr('cy', height + 33)
      .attr('r', "0")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("0")
      .attr("x", "50%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "62.5%")
      .attr('cy', height + 33)
      .attr('r', "4.27")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("0.25")
      .attr("x", "62.5%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "75%")
      .attr('cy', height + 33)
      .attr('r', "6")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("0.5")
      .attr("x", "75%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "86.5%")
      .attr('cy', height + 33)
      .attr('r', "7.36")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("0.75")
      .attr("x", "86.5%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append('circle')
      .attr('cx', "96%")
      .attr('cy', height + 33)
      .attr('r', "8.5")
      .style('fill', 'black');
    d3.select(".correlation").append("text")
      .text("1")
      .attr("x", "96%")
      .attr("y", height + 19)
      .style("font-size", "12px")

    d3.select(".correlation").append("text")
      .text("Correlation")
      .attr("x", height / 2 + 10)
      .attr("y", height + 33)
      .style("font-size", "12px")

  }

  clear() {
    this.svg.select('#cells').remove();
  }

  update(data) {
    this.data = data;
    this.prepareData(this.data);
    this.drawCells();
  }
}

export default CorrelationMatrix;
