class BoxPlot {
  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */

  constructor(_config, _data, _dispatcher) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: 350,
      containerHeight: 330,
      barWidth: 10,
      margin: { top: 25, right: 10, bottom: 20, left: 55 },
      tooltipPadding: _config.tooltipPadding || 25
    }
    this.data = _data;
    this.unchurned = _data.filter(d => d.Attrition_Flag === "Existing Customer");
    this.churned = _data.filter(d => d.Attrition_Flag === "Attrited Customer");
    this.dispatcher = _dispatcher;
    this.factor = "Customer_Age";
    this.boxPlotData = [];
    this.lineConfig=null;
    this.horizontalLineConfigs=null;
    this.selectedType = [];
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
        .attr('transform', `translate(${vis.config.margin.left+5},${vis.config.margin.top})`);

    vis.chart = vis.chartArea.append('g');

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;


    // Move the left axis over 25 pixels, and the top axis over 35 pixels

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);
    vis.yAxis = d3.axisLeft(vis.yScale)
        .tickSize(-vis.width);
    vis.yAxisG = vis.chartArea.append('g')
        .attr('class', 'axis y-axis');

    vis.xScale = d3.scaleBand()
        .range([0, vis.width])
        .padding([0.5]);
    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSize(-vis.height);
    vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${vis.height})`);

    vis.mouseG = vis.chartArea.append('g')
        .attr('class', 'mouse-over-effect')


    vis.updateVis();
  }

  updateVis() {
    // Prepare data and scales
    let vis = this;

    const groupCounts = {};
    const globalCounts = [];

    let factor = this.factor;
    groupCounts["unchurned"] = [];
    vis.unchurned.forEach(d => {
      groupCounts["unchurned"].push(d[factor]);
      globalCounts.push(d[factor]);
    })

    groupCounts["churned"] = [];
    vis.churned.forEach(d => {
      groupCounts["churned"].push(d[factor]);
      globalCounts.push(d[factor]);
    })

    // Sort group counts so quantile methods work
    for(var key in groupCounts) {
      var groupCount = groupCounts[key];
      groupCounts[key] = groupCount.sort(sortNumber);
    }
    function sortNumber(a,b) {
      return a - b;
    }
    // Prepare the data for the box plots

    // console.log(groupCounts["churned"]);
    var record = {};
    var localMin = d3.min(groupCounts["churned"]);
    var localMax = d3.max(groupCounts["churned"]);
    record["key"] = "churned";
    record["counts"] = groupCounts["churned"];
    record["quartile"] = boxQuartiles(groupCounts["churned"]);
    record["whiskers"] = findWhiskerRange();
    record["color"] = "cornflowerblue";

    function boxQuartiles(d) {
      return [
        d3.quantile(d, .25),
        d3.quantile(d, .5),
        d3.quantile(d, .75)
      ];
    }
    function findWhiskerRange() {
      const interQuantileRange = record.quartile[2] - record.quartile[0]
      let max = record.quartile[2] + 1.5 * interQuantileRange
      max = Math.min(max, localMax)
      let min = record.quartile[0] - 1.5 * interQuantileRange
      min = Math.max(min, localMin)
      return [min, max]
    }

    vis.boxPlotData.push(record);
    var record = {};
    var localMin = d3.min(groupCounts["unchurned"]);
    var localMax = d3.max(groupCounts["unchurned"]);
    record["key"] = "unchurned";
    record["counts"] = groupCounts["unchurned"];
    record["quartile"] = boxQuartiles(groupCounts["unchurned"]);
    record["whiskers"] = findWhiskerRange();
    record["color"] = "cornflowerblue";
    vis.boxPlotData.push(record);


    // console.log(vis.boxPlotData);
    // Compute an ordinal xScale for the keys in boxPlotData
    vis.xScale.domain(Object.keys(groupCounts));
    // Compute a global y scale based on the global counts
    var min = d3.min(globalCounts);
    var max = d3.max(globalCounts);

    vis.yScale.domain([0, max]);
    vis.histogram = d3.histogram()
        .domain(vis.yScale.domain())
        .thresholds(vis.yScale.ticks(20))
        .value(d => d)

    let maxNum = 0
    let churnedTemp = vis.churned.map(d => d[factor])

    vis.churnedBin = vis.histogram(churnedTemp)

    let unchurnedTemp = vis.unchurned.map(d => d[factor])
    vis.unchurnedBin = vis.histogram(unchurnedTemp)

    let lengths = vis.churnedBin.map(d => d.length)

    maxNum = d3.max(lengths)

    lengths = vis.unchurnedBin.map(d => d.length)

    let tempMax = d3.max(lengths)

    if (tempMax > maxNum) {
      maxNum = tempMax
    }


    vis.xNum = d3.scaleLinear()
        .range([0, 2.5*vis.xScale.bandwidth()])
        .domain([-maxNum, maxNum])


    vis.displayYlabel = () => {
      if (this.factor === "Customer_Age") {
        return ['Age']}
      else if (this.factor ===  "Credit_Limit" || this.factor ===  "Total_Revolving_Bal" || this.factor ===  "Total_Trans_Amt" || this.factor ===  "Avg_Open_To_Buy"){
        return ['$']}
      else if (this.factor ===  "Total_Amt_Chng_Q4_Q1" || this.factor ===  "Avg_Utilization_Ratio"){
        return ['Ratio']}
      else return ['Count']
    }
    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    vis.chartArea.selectAll(".churnedViolin")
        .data([vis.churnedBin])
        .join("path")
        .attr("class", "churnedViolin")
        .attr("d", d3.area()
            .x0(d => {
              return vis.xNum(-d.length)
            })
            .x1(d => vis.xNum(d.length))
            .y(d => vis.yScale(d.x0))
            .curve(d3.curveCatmullRom))
        .attr("transform", `translate(${vis.xScale("churned")-0.75*vis.xScale.bandwidth()}, 0)`)

    vis.chartArea.selectAll(".unchurnedViolin")
        .data([vis.unchurnedBin])
        .join("path")
        .attr("class", "unchurnedViolin")
        .attr("d", d3.area()
            .x0(d => {
              return vis.xNum(-d.length)
            })
            .x1(d => vis.xNum(d.length))
            .y(d => vis.yScale(d.x0))
            .curve(d3.curveCatmullRom))
        .attr("transform", `translate(${vis.xScale("unchurned")-0.75*vis.xScale.bandwidth()}, 0)`)

    // Draw the box plot vertical lines
    const verticalLines = vis.chartArea.selectAll(".verticalLines")
        .data(vis.boxPlotData)
        .join("line")
        .attr('class', 'verticalLines')
        .attr('x1', d => vis.xScale(d.key) + vis.config.barWidth/2)
        .attr('y1', d => vis.yScale(d.whiskers[0]))
        .attr('x2', d => vis.xScale(d.key) + vis.config.barWidth/2)
        .attr('y2', d => vis.yScale(d.whiskers[1]))
        .attr("transform", `translate(${0.5*vis.xScale.bandwidth()-0.5*vis.config.barWidth}, 0)`)
        .attr('stroke', "#001")
        .attr('stroke-width', 1)
        .attr('fill', 'none');


    // Draw the boxes of the box plot, filled in white and on top of vertical lines
    const rects = vis.chartArea.selectAll("rect")
        .data(vis.boxPlotData)
        .join('rect')
        .attr("width", vis.config.barWidth)
        .attr("height", d => vis.yScale(d.quartile[0]) - vis.yScale(d.quartile[2]))
        .attr("x", d => vis.xScale(d.key))
        .attr("y", d => vis.yScale(d.quartile[2]))
        .attr("transform", `translate(${0.5*vis.xScale.bandwidth()-0.5*vis.config.barWidth}, 0)`)
        .attr("fill", d => d.color)
        .attr("stroke", "#002")
        .attr("stroke-width", 1)
        .on('click', function(event, d) {
          // Check if current category is active and toggle class
          const isActive = d3.select(this).classed('active');
          d3.select(this).classed('active', !isActive);
          // Get the names of all active/filtered categories
          vis.selectedType = vis.chartArea.selectAll('rect.active').data().map(k => k.key)
          if (vis.selectedType.length === 2) {
            vis.chartArea.selectAll('rect.active').classed('active', false);
            vis.selectedType = [];
          }
          // Trigger filter event and pass array with the selected category names
          vis.dispatcher.call('filterCustomerType', event, vis.selectedType);
        });

    vis.chartArea.selectAll(".avg")
        .data(vis.boxPlotData)
        .join("line")
        .attr("class", "avg")
        .attr("x1", d => vis.xScale(d.key))
        .attr("y1", d => vis.yScale(d.quartile[1]))
        .attr("x2", d => vis.xScale(d.key) + vis.config.barWidth)
        .attr("y2", d => vis.yScale(d.quartile[1]))
        .attr("transform", `translate(${0.5*vis.xScale.bandwidth()-0.5*vis.config.barWidth}, 0)`)


    vis.chartArea.selectAll(".max")
        .data(vis.boxPlotData)
        .join("line")
        .attr("class", "max")
        .attr("x1", d => vis.xScale(d.key))
        .attr("y1", d => vis.yScale(d.whiskers[1]))
        .attr("x2", d => vis.xScale(d.key) + vis.config.barWidth)
        .attr("y2", d => vis.yScale(d.whiskers[1]))
        .attr("transform", `translate(${0.5*vis.xScale.bandwidth()-0.5*vis.config.barWidth}, 0)`)


    vis.chartArea.selectAll(".min")
        .data(vis.boxPlotData)
        .join("line")
        .attr("class", "min")
        .attr("x1", d => vis.xScale(d.key))
        .attr("y1", d => vis.yScale(d.whiskers[0]))
        .attr("x2", d => vis.xScale(d.key) + vis.config.barWidth)
        .attr("y2", d => vis.yScale(d.whiskers[0]))
        .attr("transform", `translate(${0.5*vis.xScale.bandwidth()-0.5*vis.config.barWidth}, 0)`)

    vis.chartArea.selectAll(".displayYlabel")
        .data(vis.displayYlabel())
        .join("text")
        .attr('class', 'displayYlabel')
        .attr('y', -20)
        .attr('x', -15)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .text(d => d);
        
    vis.xAxisG.call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG.call(vis.yAxis)
        .call(g => g.select('.domain').remove());

    vis.mouseG.append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");
  }

}
    