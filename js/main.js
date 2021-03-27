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
const dispatcher = d3.dispatch('filterCustomerType');

d3.csv('data/BankChurners.csv').then(data => {

  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr != 'Attrition_Flag' && attr != 'Dependent_count' && attr != "Gender" 
      && attr != "Education_Level" && attr != "Marital_Status" && attr != "Income_Category") {
        d[attr] = +d[attr];
      }
    });
  });


  const boxPlot = new BoxPlot({parentElement: '#boxPlot'}, data, dispatcher);
  const histogram = new Histogram({parentElement: '#histogram'}, data);

  d3.select('#quantFactor-selector').on('change', () => {
    const option = d3.select('#quantFactor-selector').property('value');
    console.log(option);
    boxPlot.factor = option;
    boxPlot.boxPlotData = [];
    boxPlot.updateVis();
    boxPlot.selectedType = [];
    histogram.factor = option;
    histogram.typeFiltered = null;
    histogram.updateVis();
  })

  dispatcher.on('filterCustomerType', selectedType => {
    console.log(selectedType);
    console.log(selectedType.length);
    if (selectedType.length === 0) {
      histogram.typeFiltered = null;
    } else {
      histogram.typeFiltered = selectedType;
    }
    histogram.updateVis();
  })

});


