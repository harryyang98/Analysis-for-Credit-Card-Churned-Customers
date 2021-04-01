# CPSC 436V Project

*Reference and source any external material here*

Reference:

* [Box plot](https://bl.ocks.org/rjurney/e04ceddae2e8f85cf3afe4681dac1d74)
* [Histogram](https://observablehq.com/@d3/histogram)
* [Violin plot](https://www.d3-graph-gallery.com/graph/violin_basicHist.html)
* [Scatterplot](https://stackoverflow.com/questions/13669239/remove-end-ticks-from-d3-js-axis)
* [PieChart](https://www.d3-graph-gallery.com/graph/pie_changeData.html)

## `boxPlot.js`

Contains the implementation for boxplot and violin plot. We put them together in one `js` file because they are sharing the axes.

* We didn't render the points for outliers in our view, because we could observe whether an outlier exist according to the violin plot.
* We rendered horizontal lines for the max and min value within the range of quartile +/- 1.5*IQR. Those horizontal lines will make the max and min more clear to be observed.
* The x-axis title is rendered dynamically according to the attribute selected in the select box. (select Age by default)
* Select the box in the boxplot will trigger interaction with the histogram.
* Planning to add hoverline.

## `histogram.js`

Contains the implementation for histogram.

* The title for the histogram (total, churned, unchurned) is rendered dynamically according to the type selected in the boxplot. It shows the distribution for total by default.
* The titles for x-axis and y-axis are rendered dynamically according to the attribute selected in the select box. (select Age by default)
* Planning to add tooltip for the histogram.

## `pieChart.js`

Contains the implementation for pie charts.

* The legends are rendered dynamically according to the attribute selected in the select box.
* When mouse over, a tooltip with percentage of current hovering pie will be shown and current hovering pie will be highlighted.
* When click, clicked pie will be enlarged and highlighted.
* Working on the interaction between the pie charts and the scatterplot. (not included in the current release)

## `scatterPlot.js`

Contains the implementation for scatterplot.

* The legends (filter) are added through `d3`.
* When mouse over the point, a tooltip will be showned.
* Working on the interaction between the pie charts and the scatterplot. (not included in the current release)


## `main.js`

Contains the data loading and dispatchers.

## `index.html`

Contains the basic webpage layout.
