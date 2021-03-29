# CPSC 436V Project

*Reference and source any external material here*

Commit Description:
1.Add css,data,js folder
2.Add style.css, index.html, boxPlot.js, histogram.js, pieChart.js, scatterPlot.js, main.js and d3.v6.min.js.
Note: d3.v6.min.js is the same as that in P2
Box plot:
https://bl.ocks.org/rjurney/e04ceddae2e8f85cf3afe4681dac1d74

Histogram:
https://observablehq.com/@d3/histogram
https://www.d3-graph-gallery.com/graph/histogram_double.html

ScatterPlot:
https://stackoverflow.com/questions/13669239/remove-end-ticks-from-d3-js-axis

PieChart:
https://www.d3-graph-gallery.com/graph/pie_annotation.html
https://observablehq.com/@d3/pie-chart
https://www.d3-graph-gallery.com/graph/pie_changeData.html


目前问题！
box plot里 click selector后旧的横线仍然存在（没有被更新）
box plot里的selector我还没有列全（目前只列了三个出来）
histogram的text在click selector之后也没有被更新 （最上方和右上方的字体一直在叠加）
histogram我现在把churned和unchurned单独画出来了，comment掉rect2可以看见到rect1，comment掉rect1可以看见到rect2，不知道怎么把他俩分别放在两张图里，也不知道怎么在一张图里结合出来……
