$.extend(Pizza, {
  bar: function (legend) {
    var settings = legend.data('settings'),
        svg = this.svg(legend, settings),
        data = legend.data('graph-data'),
        current_offset = 0,
        container = $(this.identifier(legend)),
        base_width = container.outerWidth(),
        base_height = container.outerHeight(),
        max = min = 0,
        total = 0,
        interval = (base_width - (data.length * settings.bar_spacer)) / data.length;

    for (var i = 0; i < data.length; i++) {
      if (max < data[i].value) max = data[i].value;
      if (min > data[i].value) min = data[i].value;
      total += data[i].value;
    }

    var existing_group = $('g', svg);

    if (existing_group.length > 0) {
      $(existing_group[0]).children().remove();
      var g = existing_group[0];
    } else {
      var g = this.svg_obj('g');
    }

    if (settings.show_grid) {
      this.assemble_grid(g, svg, min, max, base_width, base_height, settings);
    }

    // svg.node.setAttribute('preserveAspectRatio', 'none');

    g.setAttribute('transform', 'translate(0, ' + (base_height) +') scale(1, -1)');

    for (var i = 0; i < data.length; i++) {
      var y = (base_height) * (data[i].value / max),
          rect = this.svg_obj('rect');

      if (current_offset === 0) {
        var new_offset = current_offset;
      } else {
        var new_offset = current_offset + settings.bar_spacer;
      }

      this.set_attr(rect, {
        x : new_offset,
        y : 0,
        width : interval,
        height : y,
        fill : data[i].color,
        stroke : '#222222',
        'stroke-width' : 2
      });

      current_offset = new_offset + interval;

      g.appendChild(rect);
    }

    svg.appendChild(g);

    return [legend, svg];
  },

  assemble_grid : function (g, svg, min, max, width, height, settings) {
    var ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length,
        total_tick_height = 0;

    while (i--) {
      var line_height = total_tick_height + (height/(ticks_length-1)),
          line = this.svg_obj('line'),
          text = this.svg_obj('text');

      this.set_attr(line, {
          x1: 0,
          x2: width,
          y1: line_height,
          y2: line_height,
          stroke: 'gray',
          'stroke-width' : 1
        })
        .set_attr(text, {
          x: -25,
          y: line_height,
          transform : 'rotate(-180 -5 260) scale(-1 1)'
        })

      text.innerHTML = ticks[i];

      g.appendChild(line);
      g.appendChild(text);
      total_tick_height = line_height;
    }

  },

  bar_events : function () {}
});