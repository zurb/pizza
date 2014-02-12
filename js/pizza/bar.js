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
        total = total_tick_height = 0,
        interval = (base_width - (data.length * settings.bar_spacer)) / data.length;

    for (var i = 0; i < data.length; i++) {
      if (max < data[i].value) max = data[i].value;
      if (min > data[i].value) min = data[i].value;
      total += data[i].value;
    }

    var existing_group = $('g', svg.node);

    if (existing_group.length > 0) {
      return [legend, svg.node];
      var g = Snap(existing_group[0]);
    } else {
      var g = svg.g();
    }

    if (settings.show_grid) {
      this.assemble_grid(g, svg, min, max, base_width, base_height, settings);
    }

    // svg.node.setAttribute('preserveAspectRatio', 'none');

    g.node.setAttribute('transform', 'translate(0, ' + (base_height) +') scale(1, -1)');

    for (var i = 0; i < data.length; i++) {
      var y = (base_height) * (data[i].value / max),
          rect = svg.rect();

      console.log(base_height, data[i].value, max);

      if (current_offset === 0) {
        var new_offset = current_offset;
      } else {
        var new_offset = current_offset + settings.bar_spacer;
      }

      rect.node.setAttribute('x', new_offset);
      rect.node.setAttribute('y', 0);
      rect.node.setAttribute('width', interval);
      rect.node.setAttribute('height', y);
      rect.node.setAttribute('fill', data[i].color);
      rect.node.setAttribute('stroke', '#222222');
      rect.node.setAttribute('stroke-width', 2);

      current_offset = new_offset + interval;

      g.add(rect);
    }

    return [legend, svg.node];
  },

  assemble_grid : function (g, svg, min, max, width, height, settings) {
    var ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length;

    while (i--) {
      var line_height = total_tick_height + (450/(ticks_length-1));
      var line = svg.line(0, line_height, width, line_height);
      console.log(line_height)
      var text = g.text(-25, line_height, ticks[i]);
      text.node.setAttribute('transform', 'rotate(-180 -5 260) scale(-1 1)')
      line.node.setAttribute("stroke", "gray");
      line.node.setAttribute("stroke-width", "1");
      g.add(line);
      total_tick_height = line_height;
    }

  }
});