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
        // .tickSize(-vis.width);
    vis.yAxisG = vis.chartArea.append('g')
        .attr('class', 'axis y-axis');


    vis.xScale = d3.scaleBand()
        .range([0, vis.width]);
    vis.xAxis = d3.axisBottom(vis.xScale);
        // .ticks(5)
        // .tickSize(-vis.height);
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

    // console.log(vis.aggregatedData);

    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);
    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    var rect1 = vis.chartArea.selectAll("rect")
    .data(vis.aggregatedData1, vis.xValue)		
    .join("rect")	
    .attr("fill","steelblue")		
    .attr('x', d => vis.xScale(vis.xValue(d)))
        .attr('width', vis.xScale.bandwidth())
        .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
        .attr('y', d => vis.yScale(vis.yValue(d)))
        .attr("stroke", "#000")
        .style('opacity',.5)
        .attr("stroke-width", .2);
    
        vis.chartArea.append('text')
        .attr('class', 'axis-title')
        .attr('y', -10)
        .attr('x', vis.width/2)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('unchurned');

    // var rect2 = vis.chartArea.selectAll("rect")
    // .data(vis.aggregatedData2, vis.xValue)		
    // .join("rect")	
    // .attr("fill","red")		
    // .attr('x', d => vis.xScale(vis.xValue(d)))
    //     .attr('width', vis.xScale.bandwidth())
    //     .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
    //     .attr('y', d => vis.yScale(vis.yValue(d)))
    //     .style('opacity',.5)
    //     .attr("stroke", "#000")
    //     .attr("stroke-width", .2);

    // vis.chartArea.append('text')
    // .attr('class', 'axis-title')
    // .attr('y', -10)
    // .attr('x', vis.width/2)
    // .attr('dy', '.71em')
    // .style('text-anchor', 'end')
    // .text('churned');

    vis.xAxisG.call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG.call(vis.yAxis)
        .call(g => g.select('.domain').remove());
  }

}

