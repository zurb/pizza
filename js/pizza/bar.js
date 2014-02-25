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
      return [legend, svg];
      $(existing_group[0]).children().remove();
      var g = existing_group[0];
    } else {
      var g = this.svg_obj('g');
    }

    if (settings.show_grid) {
      this.assemble_grid(svg, min, max, base_width, base_height, settings);
    }

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
        height : 0
      });

      Snap(rect).animate({height: y}, 3000, mina[settings.animation_type]);

      current_offset = new_offset + interval;

      g.appendChild(rect);
    }

    svg.appendChild(g);

    return [legend, svg];
  },

  assemble_grid : function (svg, min, max, width, height, settings) {
    var line_g = this.svg_obj('g'),
        text_g = this.svg_obj('g'),
        ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length,
        interval = height/(ticks_length-1),
        total_tick_height = 0;

    while (i--) {
      var line_height = total_tick_height + interval,
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

  bar_events : function () {}
});