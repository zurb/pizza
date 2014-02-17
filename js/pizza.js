var Pizza = {
  version : '0.1.2',

  settings : {
    donut: false,
    donut_inner_ratio: 0.4,   // between 0 and 1
    percent_offset: 35,       // relative to radius
    stroke_color: '#333',
    stroke_width: 0,
    show_text: true,       // show or hide the percentage on the chart.
    animation_speed: 500,
    always_show_text: false,
    show_grid: true,
    bar_spacer: 50,
    bar_intervals: 6,
    animation_type: 'elastic' // options: backin, backout, bounce, easein, 
                              //          easeinout, easeout, linear
  },

  init : function (scope, options) {
    var self = this;
    this.scope = scope || document.body;

    var charts = $('[data-pie-id], [data-line-id], [data-bar-id]', this.scope);

    $.extend(true, this.settings, options)

    if (charts.length > 0) {
      charts.each(function () {
        return self.build($(this), options);
      });
    } else if ($(this.scope).is('[data-pie-id]') 
      || $(this.scope).is('[data-line-id]') 
      || $(this.scope).is('[data-bar-id]')) {
      this.build($(this.scope), options);
    }

    this.events();
  },

  events : function () {
    var self = this;

    $(window).off('.pizza').on('resize.pizza', self.throttle(function () {
      self.init();
    }, 500));

    $(this.scope).off('.pizza').on('mouseenter.pizza mouseleave.pizza touchstart.pizza', '[data-pie-id] li', function (e) {
      var parent = $(this).parent(),
          path = Snap($('#' + parent.data('pie-id') + ' path[data-id="s' + $(this).index() + '"]')[0]),
          text = Snap($(path.node).parent()
            .find('text[data-id="' + path.node.getAttribute('data-id') + '"]')[0]),
          settings = $(this).parent().data('settings');

      if (/start/i.test(e.type)) {
        $(path.node).siblings('path').each(function () {
          if (this.nodeName) {
            path.animate({
              transform: 's1 1 ' + path.node.getAttribute('data-cx') + ' ' + path.node.getAttribute('data-cy')
            }, settings.animation_speed, mina[settings.animation_type]);
            Snap($(this).next()[0]).animate({
              opacity: 0
            }, settings.animation_speed);
          }
        });
      }

      if (/enter|start/i.test(e.type)) {
        path.animate({
          transform: 's1.05 1.05 ' + path.node.getAttribute('data-cx') + ' ' + path.node.getAttribute('data-cy')
        }, settings.animation_speed, mina[settings.animation_type]);

        if (settings.show_text) {
          text.animate({
            opacity: 1
          }, settings.animation_speed);
        }
      } else {
        path.animate({
          transform: 's1 1 ' + path.node.getAttribute('data-cx') + ' ' + path.node.getAttribute('data-cy')
        }, settings.animation_speed, mina[settings.animation_type]);
        text.animate({
          opacity: 0
        }, settings.animation_speed);
      }
    });
  },

  build : function(legends, options) {
    var self = this, legend = legends, graph;

    legend.data('settings', $.extend({}, self.settings, options, legend.data('options')));
    self.data(legend, options || {});

    if (legend.data('pie-id')) {
      self.update_DOM(self.pie(legend));
    } else if (legend.data('line-id')) {
      self.update_DOM(self.line(legend));
    } else if (legend.data('bar-id')) {
      self.update_DOM(self.bar(legend));
    }
  },

  data : function (legend, options) {
    var data = [],
        count = 0;

    $('li', legend).each(function () {
      var segment = $(this);

      if (options.data) {
        data.push({
          value: options.data[segment.index()],
          text: segment.data('text'), 
          color: segment.css('color'),
          segment: segment
        });
      } else {
        data.push({
          x : segment.data('x'),
          y : segment.data('y'),
          value: segment.data('value'),
          text: segment.data('text'), 
          color: segment.css('color'),
          segment: segment
        });
      }
    });

    return legend.data('graph-data', data);
  },

  update_DOM : function (parts) {
    var legend = parts[0],
        graph = parts[1];

    return $(this.identifier(legend)).html(graph);
  },

  animate : function (el, cx, cy, settings) {
    var self = this;

    el.hover(function (e) {
      var path = Snap(e.target),
          text = Snap($(path.node).parent()
            .find('text[data-id="' + path.node.getAttribute('data-id') + '"]')[0]);

      path.animate({
        transform: 's1.05 1.05 ' + cx + ' ' + cy
      }, settings.animation_speed, mina[settings.animation_type]);

      text.touchend(function () {
        path.animate({
          transform: 's1.05 1.05 ' + cx + ' ' + cy
        }, settings.animation_speed, mina[settings.animation_type]);
      });

      if (settings.show_text) {
        text.animate({
          opacity: 1
        }, settings.animation_speed);
        text.touchend(function () {
          text.animate({
            opacity: 1
          }, settings.animation_speed);
        });
      }
    }, function (e) {
      var path = Snap(e.target),
          text = Snap($(path.node).parent()
            .find('text[data-id="' + path.node.getAttribute('data-id') + '"]')[0]);

      path.animate({
        transform: 's1 1 ' + cx + ' ' + cy
      }, settings.animation_speed, mina[settings.animation_type]);

      text.animate({
        opacity: 0
      }, settings.animation_speed);
    });
  },

  parse_options : function (string, percent, value) {
    var matches = string.match(/{{(percent|value)}}/g),
        output = '';

    for (var i = 0; i < matches.length; i++) {

      if (/percent/i.test(matches[i])) {
        output = string.replace(matches[i], [Math.ceil(percent), '%'].join(''));
      }

      if (/value/i.test(matches[i])) {
        output = output.replace(matches[i], value);
      }
    }

    return output;
  },

  svg : function (legend, settings) {
    var container = $(this.identifier(legend)),
        svg = $('svg', container),
        width = container.width(),
        height = width;

    if (svg.length > 0) {
      svg = Snap(svg[0]);
    } else {
      svg = Snap(width, height);
    }

    svg.node.setAttribute('width', '100%');
    svg.node.setAttribute('height', '100%');
    svg.node.setAttribute('viewBox', '-' + settings.percent_offset + ' -' + settings.percent_offset + ' ' + 
      (width + (settings.percent_offset * 1.5)) + ' ' + 
      (height + (settings.percent_offset * 1.5)));

    return svg;
  },

  identifier : function (legend) {
    id = legend.data('pie-id') || legend.data('bar-id') || legend.data('line-id');
    return '#' + id;
  },

  throttle : function(fun, delay) {
    var timer = null;
    return function () {
      var context = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fun.apply(context, args);
      }, delay);
    };
  },

  ticks: function (min, max, count) {
    var span = max - min,
        step = Math.pow(10, Math.floor(Math.log(span / count) / Math.LN10)),
        err = count / span * step;

    // Filter ticks to get closer to the desired count.
    if (err <= .15) step *= 10;
    else if (err <= .35) step *= 5;
    else if (err <= .75) step *= 2;

    // Round start and stop values to step interval.
    var tstart = Math.ceil(min / step) * step,
        tstop = Math.floor(max / step) * step + step * .5,
        ticks = [],
        x;

    // now generate ticks
    for (i=tstart; i < tstop; i += step) {
        ticks.push(i);  
    } 
    return ticks;
  }
};