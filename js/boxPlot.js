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
      containerHeight: 350,
      barWidth: 30,
      margin: { top: 20, right: 10, bottom: 20, left: 15 },

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

    vis.xScale = d3.scalePoint()
        .range([0, vis.width])
        .padding([0.5]);
    vis.xAxis = d3.axisBottom(vis.xScale)
        .tickSize(0);
    vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(15, ${vis.height})`);

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
    console.log(groupCounts);

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
    record["whiskers"] = [localMin, localMax];
    record["color"] = "steelblue";

    function boxQuartiles(d) {
      return [
        d3.quantile(d, .25),
        d3.quantile(d, .5),
        d3.quantile(d, .75)
      ];
    }

    vis.boxPlotData.push(record);
    var record = {};
    var localMin = d3.min(groupCounts["unchurned"]);
    var localMax = d3.max(groupCounts["unchurned"]);
    record["key"] = "unchurned";
    record["counts"] = groupCounts["unchurned"];
    record["quartile"] = boxQuartiles(groupCounts["unchurned"]);
    record["whiskers"] = [localMin, localMax];
    record["color"] = "steelblue";
    vis.boxPlotData.push(record);

    // console.log(vis.boxPlotData);
    // Compute an ordinal xScale for the keys in boxPlotData
    vis.xScale.domain(Object.keys(groupCounts));
    // Compute a global y scale based on the global counts
    var min = d3.min(globalCounts);
    var max = d3.max(globalCounts);
    // console.log(min);
    // console.log(max);
    vis.yScale.domain([min, max]);
    console.log(vis.boxPlotData)
    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    // Draw the box plot vertical lines
    const verticalLines = vis.chartArea.selectAll(".verticalLines")
        .data(vis.boxPlotData)
        .join("line")
        .attr('class', 'verticalLines')
        .attr('x1', d => vis.xScale(d.key) + vis.config.barWidth/2)
        .attr('y1', d => vis.yScale(d.whiskers[0]))
        .attr('x2', d => vis.xScale(d.key) + vis.config.barWidth/2)
        .attr('y2', d => vis.yScale(d.whiskers[1]))
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
        .attr("fill", d => d.color)
        .attr("stroke", "#002")
        .attr("stroke-width", 1);

    // Now render all the horizontal lines at once - the whiskers and the median
    vis.horizontalLineConfigs = [
      // Top whisker
      {
        x1: d => vis.xScale(d.key),
        y1: d => vis.yScale(d.whiskers[0]),
        x2: d => vis.xScale(d.key) + vis.config.barWidth,
        y2: d => vis.yScale(d.whiskers[0])
      },
      // Median line
      {
        x1: d => vis.xScale(d.key),
        y1: d => vis.yScale(d.quartile[1]),
        x2: d => vis.xScale(d.key) + vis.config.barWidth,
        y2: d => vis.yScale(d.quartile[1])
      },
      // Bottom whisker
      {
        x1: d => vis.xScale(d.key),
        y1: d => vis.yScale(d.whiskers[1]),
        x2: d => vis.xScale(d.key) + vis.config.barWidth,
        y2: d => vis.yScale(d.whiskers[1])
      }
    ];


    for(var i=0; i < vis.horizontalLineConfigs.length; i++) {
      // Draw the whiskers at the lowest, highest and mean for the series
      var horizontalLine = vis.chartArea.selectAll(".hi")
          .data(vis.boxPlotData)
          .join("line")
          .attr("class","hi")
          .attr("x1", vis.horizontalLineConfigs[i].x1)
          .attr("y1", vis.horizontalLineConfigs[i].y1)
          .attr("x2", vis.horizontalLineConfigs[i].x2)
          .attr("y2", vis.horizontalLineConfigs[i].y2)
          .attr("stroke", "#000")
          .attr("stroke-width", 2)
          .attr("fill", "none");
    }

    vis.xAxisG.call(vis.xAxis)
        .call(g => g.select('.domain').remove());

    vis.yAxisG.call(vis.yAxis)
        .call(g => g.select('.domain').remove());
  }

}
    