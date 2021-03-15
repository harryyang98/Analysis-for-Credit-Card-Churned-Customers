class Histogram {

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
      margin: _config.margin || {top: 25, right: 25, bottom: 20, left: 25},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.initVis();
  }
  
  initVis() {
    // Create SVG area, initialize scales and axes
    let vis = this;

    vis.updateVis();
  }

  updateVis() {
    // Prepare data and scales

  }

  renderVis() {
    // Bind data to visual elements, update axes

  }

}