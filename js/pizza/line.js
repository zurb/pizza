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

    var existing_group = $('g[data-id=line]', svg);

    if (existing_group.length > 0) {
      var line_g = $('g[data-id=line]', svg)[0],
          circle_g = $('g[data-id=points]', svg)[0],
          polyline = $('path[data-id=path]', line_g)[0];
    } else {
      var polyline = this.svg_obj('path'),
          line_g = this.svg_obj('g'),
          circle_g = this.svg_obj('g');

      line_g.setAttribute('data-id', 'line');
      circle_g.setAttribute('data-id', 'points');
      polyline.setAttribute('data-id', 'path');
    }

    for (var i = 0; i < data.length; i++) {
      if (existing_group.length > 0) {
        var circle = $('circle[data-id=c' + i + ']', circle_g)[0];
      } else {
        var circle = this.svg_obj('circle');

        circle.setAttribute('data-id', 'c' + i);
      }

      var x = (data[i].x / max_x) * width,
          y = (data[i].y / max_y) * height;

      points += x + ',' + y + ' ';
      this.set_attr(circle, {cx: x, cy: y,r: 0,fill: data[i].color,
        'data-value': data[i].x + ', ' + data[i].y,
        'data-tooltip': '',
        'title': data[i].x + ', ' + data[i].y,
        'class': 'has-tip tip-top'});

      Snap(circle).animate({
        r: 4
      }, 1500, mina[settings.animation_type]);

      this.animate(Snap(circle), x, y, settings, 2);

      if (existing_group.length < 1) {
        circle_g.appendChild(circle);
      }
    }

    this.flip(circle_g, height);
    this.flip(line_g, height);

    if (settings.show_grid) {
      this.assemble_grid_x(svg, min_x, max_x, width, height, settings);
      this.assemble_grid_y(svg, min_y, max_y, width, height, settings);
    }
    var v = this.points_to_path(points);

    this.set_attr(polyline, {d:v, fill: 'none', stroke: 'black', 'stroke-width': 2});

    if (existing_group.length < 1) {
      line_g.appendChild(polyline);
      svg.appendChild(line_g);
    }

    if (existing_group.length < 1) {
      svg.appendChild(circle_g);
    }

    return [legend, svg];
  },

  assemble_grid_x : function (svg, min, max, width, height, settings) {
    var existing_group = $('g[data-id=gridx]', svg);

    if (existing_group.length > 0) {
      var line_g = existing_group[0],
          text_g = $('g[data-id=labelx]', svg)[0];
    } else {
      var line_g = this.svg_obj('g'),
          text_g = this.svg_obj('g');

      line_g.setAttribute('data-id', 'gridx');
      text_g.setAttribute('data-id', 'labelx');
    }

    var ticks = this.ticks(min, max, settings.bar_intervals).reverse(),
        ticks_length = i = ticks.length,
        total_tick_width = 0,
        interval = width/(ticks_length-1);

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

      var line_width = total_tick_width + interval;

      this.set_attr(line, {
          x1 : line_width,
          x2 : line_width,
          y1 : 0,
          y2 : height,
          stroke : 'gray',
          'stroke-width' : 1,
          'stroke-dasharray' : '5,5'
        })
        .set_attr(text, {
          y: height + 20,
          x: line_width - interval,
          'text-anchor': 'middle'
        });

      if (existing_group.length < 1) {
        text.innerHTML = ticks[i];
        text_g.appendChild(text);
        line_g.appendChild(line);
      }

      total_tick_width = line_width;
    }

    line_g.setAttribute('transform', 'translate(-' + interval + ', 0)');

    if (existing_group.length < 1) {
      svg.appendChild(line_g);
      svg.appendChild(text_g);
    }
  },

  assemble_grid_y : function (svg, min, max, width, height, settings) {
    var existing_group = $('g[data-id=gridy]', svg);

    if (existing_group.length > 0) {
      var line_g = existing_group[0],
          text_g = $('g[data-id=labely]', svg)[0];
    } else {
      var line_g = this.svg_obj('g'),
          text_g = this.svg_obj('g');

      line_g.setAttribute('data-id', 'gridy');
      text_g.setAttribute('data-id', 'labely');
    }

    var ticks = this.ticks(min, max, settings.bar_intervals),
        ticks_length = i = ticks.length,
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

      var line_height = total_tick_height + (height/(ticks_length-1));

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

      if (existing_group.length < 1) {
        text_g.appendChild(text);
        line_g.appendChild(line);
        text.textContent = ticks[i];
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

  points_to_path : function (points) {
    var points = points.split(/\s+|,/);
    var x0=points.shift(), y0=points.shift();
    var pathdata = 'M'+x0+','+y0+'L'+points.join(' ');
    return ['M'+x0+','+y0+'L'].concat(points).join(' ');
  },

  line_events : function () {
    $(this.scope).on('mouseenter.pizza mouseleave.pizza touchstart.pizza', '[data-line-id] li', function (e) {
      var parent = $(this).parent(),
          path = $('#' + parent.data('line-id') + ' circle[data-id="c' + $(this).index() + '"]')[0],
          settings = $(this).parent().data('settings');

      if (/start/i.test(e.type)) {
        $(path).siblings('circle').each(function () {
          if (this.nodeName) {
            Snap(path).animate({
              transform: 's1 1 ' + path.getAttribute('cx') + ' ' + path.getAttribute('cy')
            }, settings.animation_speed, mina[settings.animation_type]);
          }
        });
      }

      if (/enter|start/i.test(e.type)) {
        Snap(path).animate({
          transform: 's2 2 ' + path.getAttribute('cx') + ' ' + path.getAttribute('cy')
        }, settings.animation_speed, mina[settings.animation_type]);
        $(path).trigger('mouseenter')
      } else {
        Snap(path).animate({
          transform: 's1 1 ' + path.getAttribute('cx') + ' ' + path.getAttribute('cy')
        }, settings.animation_speed, mina[settings.animation_type]);
        $(path).trigger('mouseout')
      }
    });
  }

});
