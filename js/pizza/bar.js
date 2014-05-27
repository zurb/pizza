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
        spacer = settings.bar_spacer * (settings.bar_spacer/ base_width),
        interval = (base_width - (data.length * spacer)) / data.length;

    if (interval < 10) {
      spacer = 1;
      interval = (base_width - (data.length * spacer)) / data.length;
    }

    for (var i = 0; i < data.length; i++) {
      if (max < data[i].value) max = data[i].value;
      if (min > data[i].value) min = data[i].value;
      total += data[i].value;
    }

    var existing_group = $('g[data-id=bars]', svg);

    if (existing_group.length > 0) {
      var g = existing_group[0];
    } else {
      var g = this.svg_obj('g');
      g.setAttribute('data-id', 'bars');
    }

    if (settings.show_grid) {
      this.assemble_grid(svg, min, max, base_width, base_height, settings);
    }

    g.setAttribute('transform', 'translate(0, ' + (base_height) +') scale(1, -1)');

    for (var i = 0; i < data.length; i++) {
      var y = (base_height) * (data[i].value / max);

      var existing_rect = $('rect[data-id=r' + i +']', g);

      if (existing_rect.length > 0) {
        var rect = existing_rect[0];
      } else {
        var rect = this.svg_obj('rect');
        rect.setAttribute('data-id', 'r' + i);
      }

      if (current_offset === 0) {
        var new_offset = current_offset;
      } else {
        var new_offset = current_offset + spacer;
      }

      rect.setAttribute('data-y', y);

      this.set_attr(rect, {
        x : new_offset,
        y : 0,
        width : interval,
        height : y,
        fill: data[i].color,
        stroke: settings.stroke_color,
        'strokeWidth': settings.stroke_width
      });

      // Snap(rect).animate({height: y}, 1500, mina[settings.animation_type]);

      current_offset = new_offset + interval;

      if (existing_group.length < 1) {
        g.appendChild(rect);
      }

      // this.animate_bar(Snap(rect), y, settings);
    }

    if (existing_group.length < 1) {
      svg.appendChild(g);
    }

    return [legend, svg];
  },

  animate_bar : function (el, y, settings) {
    var self = this,
        $el = $(el),
        new_y = y + 15;

    el.hover(function (e) {
        var path = Snap(e.target);

        path.animate({
          height: new_y
        }, settings.animation_speed, mina[settings.animation_type]);

      }, function (e) {
        var path = Snap(e.target);

        path.animate({
          height: y
        }, settings.animation_speed, mina[settings.animation_type]);
      });

  },

  assemble_grid : function (svg, min, max, width, height, settings) {
    var existing_group = $('g[data-id=bars]', svg);

    if (existing_group.length > 0) {
      var line_g = $('g[data-id=grid]', svg)[0],
          text_g = $('g[data-id=labels]', svg)[0];
    } else {
      var line_g = this.svg_obj('g'),
          text_g = this.svg_obj('g');

      line_g.setAttribute('data-id', 'grid');
      text_g.setAttribute('data-id', 'labels');
    }

    var ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length,
        interval = height/(ticks_length-1),
        total_tick_height = 0;

    while (i--) {
      if (existing_group.length > 0) {
        var line = $('line[data-id=l' + i + ']', line_g)[0],
            text = $('text[data-id=t' + i + ']', text_g)[0];
      } else {
        var line = this.svg_obj('line'),
            text = this.svg_obj('text');

        line.setAttribute('data-id', 'l' + i);
        text.setAttribute('data-id', 't' + i);
      }

      var line_height = total_tick_height + interval;

      this.set_attr(line, {
          x1 : 0,
          x2 : width,
          y1 : line_height,
          y2 : line_height,
          stroke : 'gray',
          'stroke-width' : 1,
          'stroke-dasharray' : '5,5'
        })
        .set_attr(text, {
          x : -8,
          y : line_height + 5,
          'text-anchor': 'end'
        });

      text.textContent = ticks[i];

      if (existing_group.length < 1) {
        line_g.appendChild(line);
        text_g.appendChild(text);
      }
      
      total_tick_height = line_height;
    }

    line_g.setAttribute('transform', 'translate(0, -' + total_tick_height / ticks_length + ')');
    text_g.setAttribute('transform', 'translate(0, -' + total_tick_height / ticks_length + ')');

    if (existing_group.length < 1) {
      svg.appendChild(line_g);
      svg.appendChild(text_g);
    }

  },

  bar_events : function () {
    // var self = this;

    // $(this.scope).on('mouseenter.pizza mouseleave.pizza touchstart.pizza', '[data-bar-id] li', function (e) {
    //   var parent = $(this).parent(),
    //       path = $('#' + parent.attr('data-bar-id') + ' rect[data-id=r' + $(this).index() + ']')[0],
    //       settings = $(this).parent().data('settings'),
    //       new_height = parseInt(path.getAttribute('data-y'), 10) + 15;

    //   if (/start/i.test(e.type)) {
    //     $(path).siblings('rect').each(function () {
    //       if (this.nodeName) {
    //         Snap(path).animate({
    //           height: path.getAttribute('data-y')
    //         }, settings.animation_speed, mina[settings.animation_type]);
    //       }
    //     });
    //   }

    //   if (/enter|start/i.test(e.type)) {
    //     Snap(path).animate({
    //       height: new_height
    //     }, settings.animation_speed, mina[settings.animation_type]);
    //   } else {
    //     Snap(path).animate({
    //       height: path.getAttribute('data-y')
    //     }, settings.animation_speed, mina[settings.animation_type]);
    //   }
    // });
  }
});