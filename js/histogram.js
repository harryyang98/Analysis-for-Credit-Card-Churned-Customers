class Histogram {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 700,
      containerHeight: _config.containerHeight || 350,
      margin: _config.margin || {top: 25, right: 35, bottom: 20, left: 35},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.typeFiltered = null;
    this.factor = "Customer_Age";
    this.unchurned = _data.filter(d => d.Attrition_Flag === "Existing Customer");
    this.churned = _data.filter(d => d.Attrition_Flag === "Attrited Customer");
    this.initVis();
  }

  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;
    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart
    // and position it according to the given margin config
    vis.chartArea = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
    vis.chart = vis.chartArea.append('g');

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);
    vis.yAxis = d3.axisLeft(vis.yScale);
    vis.yAxisG = vis.chartArea.append('g')
        .attr('class', 'axis y-axis');

    // vis.xScale = d3.scaleBand()
    //     .range([0, vis.width]);
    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);
    vis.xAxis = d3.axisBottom(vis.xScale);
    vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${vis.height})`);

    vis.updateVis();
  }

  updateVis() {
    // Prepare data and scales
    let vis = this;

    let factor = this.factor;
    // Prepare data: count number of leaders in each category
    vis.data.sort((a, b) => a[factor] - b[factor]);
    // i.e. [{ key: 'male', count: 10 }, {key: 'female', 20}
    console.log(this.typeFiltered);
    // if(this.typeFiltered === null){
    //   const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d[factor]);
    //   vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));
    // } else if (this.typeFiltered === "unchurned"){
    //   const aggregatedDataMap = d3.rollups(vis.unchurned, v => v.length, d => d[factor]);
    //   vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));

    //   } else if(this.typeFiltered === "churned"){
    //     const aggregatedDataMap = d3.rollups(vis.churned, v => v.length, d => d[factor]);
    //     vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));
    //       }

    // Specificy accessor functions
    vis.xValue = d => d.key;
    vis.yValue = d => d.count;

    if(this.typeFiltered === null){
      vis.xScale.domain([d3.min(vis.data, d => d[factor]),d3.max(vis.data, d=>d[factor] )]);
    } else if (this.typeFiltered === "unchurned"){
      vis.xScale.domain([d3.min(vis.unchurned, d => d[factor]),d3.max(vis.unchurned, d=>d[factor] )]);
    } else if(this.typeFiltered === "churned"){
      vis.xScale.domain([d3.min(vis.churned, d => d[factor]),d3.max(vis.churned, d=>d[factor] )]);
    }
    // vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

    var histogram = d3.histogram()
        .value(d=>d[factor])   // I need to give the vector of value
        .domain(vis.xScale.domain())  // then the domain of the graphic
        .thresholds(vis.xScale.ticks(24)); // then the numbers of bins
    if(this.typeFiltered === null){
      vis.bins = histogram(vis.data);
    }else if (this.typeFiltered === "unchurned"){
      vis.bins = histogram(vis.unchurned);
    } else if(this.typeFiltered === "churned"){
      vis.bins = histogram(vis.churned);
    }
    console.log(vis.bins);
    vis.yScale.domain([0, d3.max(vis.bins, function(d) { return d.length; })]);

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;
    // console.log(this.typeFiltered);
    //histogram
    vis.chartArea.selectAll("rect")
        .data(vis.bins)
        .join("rect")
        .attr("x", 2)
        .attr("transform", d => {
          return `translate(${vis.xScale(d.x0)}, ${vis.yScale(d.length)})`
        })
        .attr("width", d => vis.xScale(d.x1) - vis.xScale(d.x0))
        .attr("height", d => vis.height - vis.yScale(d.length))
        .style("fill", "#69b3a2")

    vis.chartArea.append('text')
        .attr('class', 'axis-title')
        .attr('y', -15)
        .attr('x', vis.width/2)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text(d => {
          if (this.typeFiltered === null) {
            return 'total'}
          else if (this.typeFiltered === "unchurned"){
            return 'unchurned'}
          else if (this.typeFiltered ===  "churned"){
            return 'churned'
          }});

    vis.chartArea.append("circle").attr("cx",vis.width-50).attr("cy",30).attr("r", 6).style("fill", "steelblue").style('opacity',.4)
    vis.chartArea.append("circle").attr("cx",vis.width-50).attr("cy",60).attr("r", 6).style("fill", "red").style('opacity',.4)
    vis.chartArea.append("text").attr("x", vis.width-40).attr("y", 30).text("unchurned").style("font-size", "15px").attr("alignment-baseline","middle")
    vis.chartArea.append("text").attr("x", vis.width-40).attr("y", 60).text("churned").style("font-size", "15px").attr("alignment-baseline","middle")

    vis.xAxisG.call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG.call(vis.yAxis)
        .call(g => g.select('.domain').remove());
  }

}

