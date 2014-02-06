Pizza.line = function (legend) {
  var svg = this.svg(legend),
      data = legend.data('graph-data'),
      max = 0,
      base = data.graph_size().y,
      interval = base / data.length,
      x_offset = 0,
      points = '',
      circles = [];

  for (var i = 0; i < data.length; i++) {
    if (data[i].value > max) {
      max = data[i].value
    }
  }

  for (var i = 0; i < data.length; i++) {
    points += x_offset + ',' + data[i].value + ' ';
    var circle = document.createElementNS(this.svgns, "circle");
    circle.setAttribute('cx', x_offset);
    circle.setAttribute('cy', data[i].value);
    circle.setAttribute('r', 3);
    circle.setAttribute('fill', data[i].color);
    circles.push(circle);
    x_offset += interval;
  }

  var polyline = document.createElementNS(this.svgns, "polyline");

  polyline.setAttribute("points", points);
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke", "black");
  polyline.setAttribute("stroke-width", "2");

  svg.appendChild(polyline);

  for (var i = 0; i < circles.length; i++) {
    svg.appendChild(circles[i]);
  }

  return [legend, svg];
};