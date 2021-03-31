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
      margin: _config.margin || {top: 15, right: 25, bottom: 20, left: 25},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.dispatcher = _dispatcher;
    this.factor = "Gender";
    this.list=[];
    this.unchurned = _data.filter(d => d.Attrition_Flag === "Existing Customer");
    this.churned = _data.filter(d => d.Attrition_Flag === "Attrited Customer");
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

    vis.radius = Math.min(vis.width, vis.height) / 2.5;

    vis.color = d3.scaleOrdinal()
        .range(d3.schemeSet2);

    vis.chartArea.append("g")
        .attr("class", "unchurned")

    vis.chartArea.append("g")
        .attr("class", "churned")
        .attr("transform", "translate(250, 0)")

    vis.chartArea.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(400,0)")


    vis.updateVis();
  }

  updateVis() {
    // Prepare data and scales
    let vis= this;
    vis.list = []
    console.log(vis.churned)
    vis.pieChartData_churned = d3.group(vis.churned, d => d[vis.factor]);
    vis.pieChartData_churned.forEach(d=>{
      const temp ={};
      temp["name"] = d[0][vis.factor];
      temp["value"] = d.length;
      temp["type"] = "churned"

      vis.list.push(temp);
    });
    vis.color = d3.scaleOrdinal()
        .domain(vis.list.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), vis.list.length).reverse());

    vis.pie = d3.pie()
        .value(d => d.value);

    vis.data_ready_churned = vis.pie(vis.list)

    vis.list = []
    vis.pieChartData_unchurned = d3.group(vis.unchurned, d => d[vis.factor])
    vis.pieChartData_unchurned.forEach(d=>{
      const temp ={};
      temp["name"] = d[0][vis.factor];
      temp["value"] = d.length;
      temp["type"] = "unchurned"
      vis.list.push(temp);
    });
    vis.data_ready_unchurned = vis.pie(vis.list)
    console.log(vis.data_ready_unchurned)

    vis.total = {
      churned: vis.churned.length,
      unchurned: vis.unchurned.length
    }

    vis.renderVis();
  }

  renderVis() {
    // Bind data to visual elements, update axes
    let vis = this;

    // https://stackoverflow.com/questions/5963182/how-to-remove-spaces-from-a-string-using-javascript
    vis.chartArea.selectAll("g.unchurned")
        .selectAll("path.unchurned.pie")
        .data(vis.data_ready_unchurned)
        .join("path")
        .attr("class", 'unchurned pie')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(vis.radius)
        )
        .attr('fill', d => vis.color(d.data.name))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)

    vis.chartArea.selectAll("g.churned")
        .selectAll("path.churned.pie")
        .data(vis.data_ready_churned)
        .join("path")
        .attr("class", 'churned pie')
        .attr('d', d3.arc()
            .innerRadius(0)
            .outerRadius(vis.radius)
        )
        .attr('fill', d => vis.color(d.data.name))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .style("opacity", 1)

    vis.chartArea.selectAll("g.unchurned")
        .selectAll("text.unchurned")
        .data(["unchurned"])
        .join("text")
        .attr("class", "unchurned")
        .text(d => d)
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0, -100)")

    vis.chartArea.selectAll("g.churned")
        .selectAll("text.churned")
        .data(["churned"])
        .join("text")
        .attr("class", "churned")
        .text(d => d)
        .attr("text-anchor", "middle")
        .attr("transform", "translate(0, -100)")




    const labelHeight = 18
    const legend = vis.chartArea.selectAll("g.legend")
        .selectAll(".pieLegend")
        .data(vis.data_ready_unchurned)
        .join("rect")
        .attr("class", "pieLegend")
        .attr("y", d => labelHeight * d.index * 1.8)
        .attr("width", labelHeight)
        .attr("height", labelHeight)
        .attr("fill", d => vis.color(d.data.name))
        .attr("transform", `translate(0, ${-0.5*vis.height})`)

    const legendText = vis.chartArea.selectAll("g.legend")
        .selectAll(".pieLegendText")
        .data(vis.data_ready_unchurned)
        .join("text")
        .attr("class", "pieLegendText")
        .text(d => d.data.name)
        .attr("x", labelHeight * 1.2)
        .attr("y", d => labelHeight * d.index * 1.8)
        .attr("transform", d => `translate(0, ${-0.5*vis.height + labelHeight})`)
        .attr("dy", "-0.2em")

    const pie = vis.chartArea.selectAll(".pie")

    pie.on('mouseover', function(event, d){
      let other = null
      vis.chartArea.selectAll('.pie')
          .classed("active", g => {
            if (g.data.name === d.data.name) {
              if (g !== d) {
                other = g
              }
              return true
            }
          });

      console.log(other.data)
      d3.select('#tooltip')
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          // TODO
          .html(
              `
              <div class="tooltip-title"> ${d.data.type} ${d.data.name}</div>
              <ul>
                <li>Percentage: ${d3.format(".0%")(d.data.value / vis.total[d.data.type])}</li>
                <li>Percentage in ${other.data.type}: ${d3.format(".0%")(other.data.value / vis.total[other.data.type])}</li>
              </ul>
            `);
    })
        .on('mouseleave', function(event, d){
          d3.select('#tooltip').style('display', 'none');
          vis.chartArea.selectAll('.pie')
              .classed("active", g => {
                if (g === d) {
                  const isSelect = d3.select(this).classed('select')
                  return isSelect
                } else if (g.data.name === d.data.name) {
                  return false
                }
              })
        })
        .on('click', function(event, d) {
          const isSelect = d3.select(this).classed("select")
          d3.select(this).classed('select', !isSelect);
          if (!isSelect) {
            d3.select(this).classed('active', true)
          } else {
            d3.select(this).classed('active', false)
          }

          if (!isSelect) {
            d3.select(this).attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(1.1*vis.radius)
            )
          } else {
            d3.select(this).attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(vis.radius)
            )
          }

        })


  }

}