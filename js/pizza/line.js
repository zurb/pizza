$.extend(Pizza, {
  line : function (legend) {
    var settings = legend.data('settings'),
        svg = this.svg(legend, settings),
        data = legend.data('graph-data'),
        max_x = max_y = min_x = min_y = 0,
        container = $(this.identifier(legend)),
        base_width = container.outerWidth(),
        base_height = container.outerHeight(),
        interval = base_width / data.length,
        x_offset = 0,
        total_x = total_y = 0,
        points = '',
        circles = [];

    for (var i = 0; i < data.length; i++) {
      if (data[i].x > max_x) max_x = data[i].x;
      if (data[i].y > max_y) max_y = data[i].y;
      if (min_x > data[i].x) min_x = data[i].x;
      if (min_y > data[i].y) min_y = data[i].y;
      total_x += data[i].x;
      total_y += data[i].y;
    }

    var existing_group = $('g', svg);

    if (existing_group.length > 0) {
      $(existing_group[0]).children().remove();
      var g = existing_group[0];
    } else {
      var g = this.svg_obj('g');
    }

    g.setAttribute('transform', 'translate(0, ' + base_height +') scale(1, -1)');

    if (settings.show_grid) {
      this.assemble_grid_x(g, svg, min_x, max_x, base_width, base_height, settings);
      this.assemble_grid_y(g, svg, min_y, max_y, base_width, base_height, settings);
    }

    for (var i = 0; i < data.length; i++) {
      var x = (data[i].x / max_x) * base_width,
          y = (data[i].y / max_y) * base_height;

      points += x + ',' + y + ' ';
      var circle = this.svg_obj('circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 4);
      circle.setAttribute('fill', data[i].color);
      circles.push(circle);
    }

    var polyline = this.svg_obj('polyline');

    polyline.setAttribute("points", points);
    polyline.setAttribute("fill", "none");
    polyline.setAttribute("stroke", "black");
    polyline.setAttribute("stroke-width", "2");

    g.appendChild(polyline);

    for (var i = 0; i < circles.length; i++) {
      g.appendChild(circles[i]);
    }

    svg.appendChild(g);

    return [legend, svg];
  },

  assemble_grid_x : function (g, svg, min, max, width, height, settings) {
    var ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length;

    console.log('ticks_x: ', ticks);

    // while (i--) {
    //   var line_height = total_tick_height + (height/(ticks_length-1));
    //   var line = svg.line(0, line_height, width, line_height);
    //   var text = g.text(-25, line_height, ticks[i]);
    //   text.node.setAttribute('transform', 'rotate(-180 -5 260) scale(-1 1)');
    //   line.node.setAttribute("stroke", "gray");
    //   line.node.setAttribute("stroke-width", "1");
    //   g.add(line);
    //   total_tick_height = line_height;
    // }

  },

  assemble_grid_y : function (g, svg, min, max, width, height, settings) {
    var ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length,
        total_tick_height = 0;

    console.log('ticks_y: ', ticks);

    while (i--) {
      var line_height = total_tick_height + (height/(ticks_length -1));
      var line = this.svg_obj('line');
      line.setAttribute('x1', 0);
      line.setAttribute('x2', width);
      line.setAttribute('y1', line_height);
      line.setAttribute('y2', line_height);
      var text = this.svg_obj('text');
      text.setAttribute('x', -25);
      text.setAttribute('y', line_height);
      text.innerHTML = ticks[i];
      text.setAttribute('transform', 'rotate(-180 0 270) scale(-1 1)');
      line.setAttribute("stroke", "gray");
      line.setAttribute("stroke-width", "1");
      g.appendChild(line);
      g.appendChild(text);
      total_tick_height = line_height;
    }

  }
});