Pizza.bar = function (legend) {
  var svg = this.svg(legend),
      data = legend.data('graph-data'),
      current_offset = 0,
      container = $(this.identifier(legend)),
      base_width = container.width() / 1.15,
      base_height = this.get_height(container),
      spacer = 5,
      max = 0,
      total = 0,
      interval = (base_width - (data.length * spacer)) / data.length;

  for (var i = 0; i < data.length; i++) {
    if (max < data[i].value) max = data[i].value;
    total += data[i].value;
  }

  var g = document.createElementNS(this.svgns, "g");

  g.setAttribute('transform', 'translate(0, ' + (base_height - 2) +') scale(1, -1)');

  for (var i = 0; i < data.length; i++) {
    var y = (base_height - 5) * (data[i].value / max),
        rect = document.createElementNS(this.svgns, "rect");

    if (current_offset === 0) {
      var new_offset = current_offset;
    } else {
      var new_offset = current_offset + spacer;
    }

    rect.setAttribute('x', new_offset + 5);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', interval);
    rect.setAttribute('height', y);
    rect.setAttribute('fill', data[i].color);
    rect.setAttribute('stroke', '#222222');
    rect.setAttribute('stroke-width', 2);

    current_offset = new_offset + interval;

    g.appendChild(rect);
  }

  svg.appendChild(g);

  return [legend, svg];
};