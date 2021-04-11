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
const dispatcher = d3.dispatch('filterCustomerType', 'filterInPie');

d3.csv('data/BankChurners.csv').then(data => {

  // Convert columns to numerical values
  data.forEach(d => {
    Object.keys(d).forEach(attr => {
      if (attr !== 'Attrition_Flag' && attr !== 'Dependent_count' && attr !== "Gender"
      && attr !== "Education_Level" && attr !== "Marital_Status" && attr !== "Income_Category") {
        d[attr] = +d[attr];
      }
    });
  });


  const boxPlot = new BoxPlot({parentElement: '#boxPlot'}, data, dispatcher);
  const histogram = new Histogram({parentElement: '#histogram'}, data);
  const scatterPlot = new ScatterPlot({parentElement: '#scatterPlot'}, data);
  const pieChart = new PieChart({parentElement: '#pieChart'}, data, dispatcher);

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
    pieChart.typeFiltered = null
    pieChart.selectCategory = null;
    pieChart.updateVis();
  });

  d3.select('#cateFactor-selector').on('change', () => {
    const option = d3.select('#cateFactor-selector').property('value');
    pieChart.factor = option;
    pieChart.list = [];
    if (pieChart.typeFiltered === null) {
      pieChart.selectCategory = [];
    }
    pieChart.updateVis();
  });

  dispatcher.on('filterCustomerType', selectedType => {
    // dispatcher in box plot
    if (selectedType.length === 0) {
      histogram.typeFiltered = null;
      pieChart.typeFiltered = null;
    } else {
      histogram.typeFiltered = selectedType;
      pieChart.typeFiltered = selectedType;
      console.log(selectedType);
    }
    histogram.updateVis();
    pieChart.updateVis();
  })
  dispatcher.on('filterInPie', selectCategoryInfo => {
    // dispatcher in pie chart
    // should link with scatterplot
    if (selectCategoryInfo.length === 0) {
      histogram.typeFiltered = null;
    } else {
      // selectCategoryInfo = Array = {name, value, type}
      console.log(selectCategoryInfo)
      // histogram.typeFiltered = [selectCategoryInfo[0].type]
    }
    // histogram.updateVis()
  })

});


