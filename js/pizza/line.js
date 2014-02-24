$.extend(Pizza, {
  line : function (legend) {
    var settings = legend.data('settings'),
        svg = this.svg(legend, settings),
        container = $(this.identifier(legend)),
        width = container.outerWidth(),
        height = container.outerHeight(),
        data = legend.data('graph-data'),
        max_x = max_y = min_x = min_y = total_x = total_y = 0,
        i = data.length,
        points = '';

    for (var i = 0; i < data.length; i++) {
      if (data[i].x > max_x) max_x = data[i].x;
      if (data[i].y > max_y) max_y = data[i].y;
      if (min_x > data[i].x) min_x = data[i].x;
      if (min_y > data[i].y) min_y = data[i].y;
      total_x += data[i].x;
      total_y += data[i].y;
    }

    var polyline = this.svg_obj('polyline'),
        line_g = this.svg_obj('g'),
        circle_g = this.svg_obj('g');

    for (var i = 0; i < data.length; i++) {
      var x = (data[i].x / max_x) * width,
          y = (data[i].y / max_y) * height,
          circle = this.svg_obj('circle');

      points += x + ',' + y + ' ';
      this.set_attr(circle, {cx: x, cy: y,r: 4,fill: data[i.color]});

      circle_g.appendChild(circle);
    }

    this.flip(circle_g, height);
    this.flip(line_g, height);

    if (settings.show_grid) {
      this.assemble_grid_x(svg, min_x, max_x, width, height, settings);
      this.assemble_grid_y(svg, min_y, max_y, width, height, settings);
    }

    this.set_attr(polyline, {points:points, fill: 'none', stroke: 'black', 'stroke-width': 2});

    line_g.appendChild(polyline);
    svg.appendChild(line_g);
    svg.appendChild(circle_g);

    return [legend, svg];
  },

  assemble_grid_x : function (svg, min, max, width, height, settings) {
    var text_g = this.svg_obj('g'),
        ticks = this.ticks(min, max, settings.bar_intervals).reverse(),
        ticks_length = i = ticks.length,
        total_tick_width = 0,
        interval = width/(ticks_length-1);

    while (i--) {
      var line_width = total_tick_width + interval,
          text = this.svg_obj('text');

      this.set_attr(text, {
        y: height + 20,
        x: line_width - interval,
        'text-anchor': 'middle'
      });

      text.innerHTML = ticks[i];

      text_g.appendChild(text);
      total_tick_width = line_width;
    }

    svg.appendChild(text_g);
  },

  assemble_grid_y : function (svg, min, max, width, height, settings) {
    var line_g = this.svg_obj('g'),
        text_g = this.svg_obj('g'),
        ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length,
        total_tick_height = 0;

    while (i--) {
      var line_height = total_tick_height + (height/(ticks_length-1)),
          line = this.svg_obj('line'),
          text = this.svg_obj('text');

      this.set_attr(line, {
          x1 : 0,
          x2 : width,
          y1 : line_height,
          y2 : line_height,
          stroke : 'gray',
          'stroke-width' : 1
        })
        .set_attr(text, {
          x : -5,
          y : line_height,
          'text-anchor': 'end'
        });

      text.innerHTML = ticks[i];

      line_g.appendChild(line);
      text_g.appendChild(text);
      total_tick_height = line_height;
    }

    line_g.setAttribute('transform', 'translate(0, -' + total_tick_height / ticks_length + ')');
    text_g.setAttribute('transform', 'translate(0, -' + total_tick_height / ticks_length + ')');

    svg.appendChild(line_g);
    svg.appendChild(text_g);

  },

  line_events : function () {}
});