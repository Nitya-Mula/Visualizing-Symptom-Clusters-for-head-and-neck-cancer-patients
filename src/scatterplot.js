import * as d3 from 'd3';

class ScatterPlot {
  drawHexagon(data) {
    return d3.line()
      .x(function (d) { return d.x; })
      .y(function (d) { return d.y; })
      .curve(d3.curveCardinalClosed.tension(0.65))(data);
  }

  constructor(selector, width, height, data, onPatientSelected) {
    this.selector = selector;
    this.width = width;
    this.height = height;
    this.data = data;
    this.onPatientSelected = onPatientSelected;
  }

  pack(data) {
    const { width, height } = this;
    const packer = d3.pack().size([width - 2, height - 2]).padding(3);
    return packer(d3.hierarchy({ children: data }).sum(d => d.cluster + 1));
  }

  init() {
    const { data, width, height } = this;
    const root = this.pack(data);

    this.colorScale = d3.scaleOrdinal()
      .domain(d3.extent(data.map(d => d.cluster)))
      .range(['#de2d26', '#fee0d2', '#fc9272'])

    this.svg = d3.select(this.selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr("viewBox", `0 0 ${width}, ${height}`)
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr('preserveAspectRatio', "xMidYMid meet");

    this.drawLeaves(root.leaves());
  }

  drawLeaves(leaves) {
    const { svg, onPatientSelected } = this;
    const leaf = svg.selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`)
      .classed("leaf", true)
      .attr("id", d => (d.leafUid = `leaf-container-${d.data.patientId}`))
      .style('cursor', 'pointer');

    leaf.append("path")
      .attr("d", d => {
        const h = (Math.sqrt(3) / 2),
          radius = d.r,
          xp = 0,
          yp = 0,
          hexagonData = [
            { "x": radius + xp, "y": yp },
            { "x": radius / 2 + xp, "y": radius * h + yp },
            { "x": -radius / 2 + xp, "y": radius * h + yp },
            { "x": -radius + xp, "y": yp },
            { "x": -radius / 2 + xp, "y": -radius * h + yp },
            { "x": radius / 2 + xp, "y": -radius * h + yp }
          ];
        return this.drawHexagon(hexagonData);
      })
      .attr("id", d => (d.leafUid = `leaf-${d.data.patientId}`))
      .attr("fill", d => this.colorScale(d.data.cluster))
      .attr("stroke", d => this.colorScale(d.data.cluster))
      .attr("stroke-opacity", d => d.data.gender === 'Female' ? 0 : 1.0)
      .attr("fill-opacity", d => d.data.gender === 'Female' ? 0 : 0.5);

    leaf.append("circle")
      .attr("id", d => (d.leafUid = `leaf-${d.data.patientId}`))
      .attr("r", d => d.r)
      .attr("fill", d => this.colorScale(d.data.cluster))
      .attr("stroke", d => this.colorScale(d.data.cluster))
      .attr("stroke-opacity", d => d.data.gender === 'Male' ? 0 : 1.0)
      .attr("fill-opacity", d => d.data.gender === 'Male' ? 0 : 0.5);

    leaf.append("text")
      .text(d => d.data.patientId);

    leaf.append("title")
      .text(d => d.data.patientId);
  }

  highlight(ids) {
    if (!ids || ids.length === 0) {
      this.svg.selectAll('.leaf').style('opacity', 1);
      return;
    }

    // lower opacity of all leaves
    const leaves = this.svg.selectAll('.leaf');
    leaves.style('opacity', 0.35);

    // increase opacity of selected leaves
    ids.forEach((id) => {
      this.svg.select(`#leaf-container-${id}`).style('opacity', 1);
    });
  }

  clear() {
    this.svg.selectAll('.leaf').remove();
  }

  update(data) {
    this.data = data;
    const leaves = this.pack(data).leaves();
    this.drawLeaves(leaves);
  }
}

export default ScatterPlot;
