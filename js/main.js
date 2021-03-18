/**
 * Load data from CSV file asynchronously and render charts
 */

/*
 * Todo:
 * - initialize views
 * - filter data
 * - listen to events and update views
 * - dispatchers
 */


let filteredData;

d3.csv('data/BankChurners.csv').then(data => {

  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr == 'Customer_Age') {
        d[attr] = (d[attr] == 'NA') ? null : +d[attr];
      } else if (attr != 'Attrition_Flag' && attr != 'Dependent_count' && attr != 'gender') {
        d[attr] = +d[attr];
      }
    });
  });

  data.sort((a, b) => a.label - b.label);

  const boxPlot = new BoxPlot({parentElement: '#boxPlot'}, data);

  d3.select('#quantFactor-selector').on('change', () => {
    const option = d3.select('#quantFactor-selector').property('value');
    console.log(option);
    boxPlot.factor = option;
    boxPlot.boxPlotData = [];
    boxPlot.updateVis();

  })

});


