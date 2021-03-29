class ScatterPlot {

  /**
   * Class constructor with initial configuration
   * @param {Object}
   * @param {Array}
   */

  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 750,
      containerHeight: _config.containerWidth || 250,
      margin: _config.margin || {top: 30, right: 25, bottom: 20, left: 50},
      tooltipPadding: _config.tooltipPadding || 15,
      legendWidth: 170,
      legendHeight: 8,
      legendRadius: 5
    };
    this.data = _data;
    //this.unchurned = _data.filter(d => d.Attrition_Flag === "Existing Customer");
    //this.churned = _data.filter(d => d.Attrition_Flag === "Attrited Customer");
    this.filteredData = _data.filter(d => d['Customer_Age']>=20 && d['Customer_Age']<=30);
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

    //vis.chart = vis.chartArea.append('g');

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0]);
    vis.yAxis = d3.axisLeft(vis.yScale).tickSize(0);
    vis.yAxisG = vis.chartArea.append('g')
        .attr('class', 'axis y-axis');

    vis.xScale = d3.scaleLinear()
        .range([0, vis.width]);
    vis.xAxis = d3.axisBottom(vis.xScale).tickSize(0);
    vis.xAxisG = vis.chartArea.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0, ${vis.height})`);
    vis.updateVis();
    vis.renderLegend();
  }

  updateVis() {
    // Prepare data and scales
    let vis = this;
    vis.xScale.domain([0,d3.max(this.filteredData, d=>d['Total_Trans_Ct'])]);
    vis.yScale.domain([0,d3.max(this.filteredData, d=>d['Total_Trans_Amt'])]);
    vis.yValue = d=>d['Total_Trans_Amt'];
    vis.xValue = d=>d['Total_Trans_Ct'];
    vis.legendPosX = (d,rank)=> Math.floor(rank / 3) * 150;
    vis.legendPosY = (d,rank)=>  (rank % 3) * 20;
    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;
    vis.xAxisG
        .call(vis.xAxis);

    this.svg.selectAll(".tick")
        .each(function (d, i) {
          if ( d === 0 ) {
            this.remove();
          }
        });

     vis.yAxisG
         .call(vis.yAxis);

    //print points.
    const circles = vis.chartArea.selectAll('.point')
        .data(vis.filteredData)
        .join('circle')
        .attr('class', 'point')
        .attr('r', 5)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)));

    // //when mouse is over the point, show tooltip with detailed information.
    // circles
    //     .on('mouseover', (event,d) => {
    //       if(gender.includes(d.gender) || gender.length===0){
    //         d3.select('#tooltip')
    //             .style('display', 'block')
    //             .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
    //             .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
    //             .html(
    //                 `
    //           <div class="tooltip-title">${d.leader}</div>
    //           <div><i>${d.country}, ${d.start_year}-${d.end_year}</i></div>
    //           <ul>
    //             <li>Age at inauguration: ${d.start_age}</li>
    //             <li>Time in office: ${d.duration} years</li>
    //             <li>GDP/capita: ${d.pcgdp}</li>
    //           </ul>
    //         `);
    //       }
    //     })
    //     .on('mouseleave', () => {
    //       d3.select('#tooltip').style('display', 'none');
    //     });

  }

  renderLegend(){
    let vis = this;

    vis.legend = [];
    // push all 5 names and corresponding category to the legend array
    vis.legend.push({
      title: "20-30",
      category: "20-30"});

    vis.legend.push({
      title: "31-40",
      category: "31-40"});

    vis.legend.push({
      title: "41-50",
      category: "41-50"});

    vis.legend.push({
      title: "51-60",
      category: "51-60"});

    vis.legend.push({
      title: "61-70",
      category: "61-70"});

    vis.legend.push({
      title: "71-80",
      category: "71-80"});


    //initialize the drawing area for legend
    vis.legendArea = vis.svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${vis.config.margin.left+30},${vis.config.margin.top})`);

    // for each legend, draw a circle
    const leg =vis.legendArea.selectAll('circle')
        .data(vis.legend);

    const legEnter= leg.enter()
        .append('circle')
        .attr('r', vis.config.legendRadius)
        .attr('cy', vis.legendPosY)
        .attr('cx', vis.legendPosX)
        .attr('class', 'legend-btn')
        .attr('class', d=>{
            if (d.title ==="20-30"){
                return 'legend-btn active'
            }else{
                return 'legend-btn inactive'
            }
        })
        .attr('category', d => `${d.category}`)
        .style("stroke", "grey");    //outline with color grey


    const legLabel = vis.legendArea.selectAll('.legend-text')
        .data(vis.legend);
    //enter, legend dont need update
    const legLabelEnter = legLabel.enter()
        .append('text')
        .attr('class', 'legend-text')
        .attr('y', vis.legendPosY)
        .attr('x', vis.legendPosX)
        .attr('dx', "1em")
        .style('alignment-baseline', 'middle')
        .text(d => d.title);

    //for each legend, click on it will change its state between active and inactive
    vis.legend.forEach(legend => {

    })


  }

}