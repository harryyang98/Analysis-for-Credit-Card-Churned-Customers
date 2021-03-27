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
      margin: _config.margin || {top: 25, right: 25, bottom: 20, left: 25},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
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
    const aggregatedDataMap = d3.rollups(vis.data, v => v.length, d => d[factor]);
    vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({ key, count }));
 
    const aggregatedDataMap1 = d3.rollups(vis.unchurned, v => v.length, d => d[factor]);
    vis.aggregatedData1 = Array.from(aggregatedDataMap1, ([key, count]) => ({ key, count }));
 
    const aggregatedDataMap2 = d3.rollups(vis.churned, v => v.length, d => d[factor]);
    vis.aggregatedData2 = Array.from(aggregatedDataMap2, ([key, count]) => ({ key, count }));

    // Specificy accessor functions
    vis.xValue = d => d.key;
    vis.yValue = d => d.count;

    vis.xScale.domain([d3.min(vis.data, d => d[factor]),d3.max(vis.data, d=>d[factor] )]);
    //TODO:
    // vis.yScale.domain([0, d3.max(bins, function(d) { return d.length; })]);
    vis.yScale.domain([0, d3.max(vis.aggregatedData1, vis.yValue)]);

    var histogram = d3.histogram()
    .value(d=>d[factor])   // I need to give the vector of value
    .domain(vis.xScale.domain())  // then the domain of the graphic
    .thresholds(vis.xScale.ticks(24)); // then the numbers of bins

    vis.bins = histogram(vis.unchurned);

    console.log(vis.bins); //TODO: print nothing??



    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    //histogram of unchurned
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
        .text('unchurned');

    //histogram of churned
    // const rect2 = vis.chartArea.selectAll("rect")
    // .data(vis.aggregatedData2, vis.xValue)		
    // .join("rect")	
    // .attr("fill","red")		
    // .attr('x', d => vis.xScale(vis.xValue(d)))
    //     .attr('width', vis.xScale.bandwidth())
    //     .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
    //     .attr('y', d => vis.yScale(vis.yValue(d)))
    //     .style('opacity',.4);

    vis.chartArea.append('text')
    .attr('class', 'axis-title')
    .attr('y', -15)
    .attr('x', vis.width/2)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text('churned');

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

