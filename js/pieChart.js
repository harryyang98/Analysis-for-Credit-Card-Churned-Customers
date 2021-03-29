class PieChart {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */

  constructor(_config, _data, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 750,
      containerHeight: _config.containerWidth || 250,
      margin: _config.margin || {top: 25, right: 25, bottom: 20, left: 25},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.dispatcher = _dispatcher;
    this.factor = "Gender";
    this.list=[];
    this.initVis();
  }
  
  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', "translate(150,120)");

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.radius = Math.min(vis.width, vis.height) / 2;

    vis.color = d3.scaleOrdinal()
        .range(d3.schemeSet2);

    vis.updateVis();
  }

  updateVis() {
    // Prepare data and scales
    let vis= this;
    vis.pieChartData=d3.group(vis.data, d => d[vis.factor]);
    vis.pieChartData.forEach(d=>{
      const temp ={};
      temp["name"] = d[0][vis.factor];
      temp["value"] = d.length;
      vis.list.push(temp);
    });

    vis.color = d3.scaleOrdinal()
        .domain(vis.list.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), vis.list.length).reverse());

    vis.pie = d3.pie()
        .value(d => d.value);

    vis.data_ready = vis.pie(this.list);

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;



    // map to data
    const u = this.chartArea.selectAll("path")
        .data(vis.data_ready);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    u
        .enter()
        .append('path')
        .merge(u)
        .transition()
        .duration(800)
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(vis.radius)
        )
        .attr('fill', d => vis.color(d.data.name))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1);

    // remove the group that is not present anymore
    u
        .exit()
        .remove();
  }

}