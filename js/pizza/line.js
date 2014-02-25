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

    var polyline = this.svg_obj('path'),
        line_g = this.svg_obj('g'),
        circle_g = this.svg_obj('g');

    for (var i = 0; i < data.length; i++) {
      var x = (data[i].x / max_x) * width,
          y = (data[i].y / max_y) * height,
          circle = this.svg_obj('circle');

      points += x + ',' + y + ' ';
      this.set_attr(circle, {cx: x, cy: y,r: 0,fill: data[i.color],
        'data-value': data[i].x + ', ' + data[i].y,
        'data-tooltip': '',
        'title': data[i].x + ', ' + data[i].y,
        'class': 'has-tip tip-top',
        'data-id': 'pL' + i});

      Snap(circle).animate({
        r: 4
      }, 1500, mina[settings.animation_type]);

      this.animate(circle, x, y, settings, 2);

      circle_g.appendChild(circle);
    }

    this.flip(circle_g, height);
    this.flip(line_g, height);

    if (settings.show_grid) {
      this.assemble_grid_x(svg, min_x, max_x, width, height, settings);
      this.assemble_grid_y(svg, min_y, max_y, width, height, settings);
    }
    var v = this.points_to_path(points),
        v_l = v.length,
        v_i = 1,
        v_offset = 'M0,0,L0 0';

    this.set_attr(polyline, {d:v_offset, fill: 'none', stroke: 'black', 'stroke-width': 2});

    line_g.appendChild(polyline);
    svg.appendChild(line_g);

    function line_anim(l, v, v_l, v_i, v_offset, start, duration) {
      var n_offset = [v_offset, v[v_i]].join(' '),
          total = (+ new Date()) - start,
          step = (duration - total) / v.length;

      l.animate({
        d: n_offset
      }, step, mina.linear, function () {
        v_offset = n_offset;
        v_i++;
        if (v_i > v.length) return;
        line_anim(l, v, v_l, v_i, v_offset, start, duration);
      });
    }

    line_anim(Snap(polyline), v, v_l, v_i, v_offset, (+ new Date()), settings.animation_speed);

    svg.appendChild(circle_g);

    return [legend, svg];
  },

  assemble_grid_x : function (svg, min, max, width, height, settings) {
    var line_g = this.svg_obj('g'),
        text_g = this.svg_obj('g'),
        ticks = this.ticks(min, max, settings.bar_intervals).reverse(),
        ticks_length = i = ticks.length,
        total_tick_width = 0,
        interval = width/(ticks_length-1);

    while (i--) {
      var line_width = total_tick_width + interval,
          line = this.svg_obj('line'),
          text = this.svg_obj('text');

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

      text.innerHTML = ticks[i];

      text_g.appendChild(text);
      line_g.appendChild(line);
      total_tick_width = line_width;
    }

    line_g.setAttribute('transform', 'translate(-' + interval + ', 0)');
    svg.appendChild(line_g);
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
          'stroke-width' : 1,
          'stroke-dasharray' : '5,5'
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

  points_to_path : function (points) {
    var points = points.split(/\s+|,/);
    var x0=points.shift(), y0=points.shift();
    var pathdata = 'M'+x0+','+y0+'L'+points.join(' ');
    return ['M'+x0+','+y0+'L'].concat(points);
  },

  line_events : function () {
    $(this.scope).off('.pizza').on('mouseenter.pizza mouseleave.pizza touchstart.pizza', '[data-line-id] li', function (e) {
      var parent = $(this).parent(),
          path = $('#' + parent.data('line-id') + ' circle[data-id="pL' + $(this).index() + '"]')[0],
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