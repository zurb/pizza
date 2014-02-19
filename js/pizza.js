var Pizza = {
  version : '0.1.2',

  settings : {
    donut: false,
    donut_inner_ratio: 0.4,   // between 0 and 1
    percent_offset: 35,       // relative to radius
    stroke_color: 'transparent',
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

  NS : 'http://www.w3.org/2000/svg',

  init : function (scope, options) {
    var self = this;
    this.scope = scope || document.body;

    var charts = $('[data-pie-id], [data-line-id], [data-bar-id]', this.scope);

    $.extend(true, this.settings, options);

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
          path = $('#' + parent.data('pie-id') + ' path[data-id="s' + $(this).index() + '"]')[0],
          text = $(path).parent().find('text[data-id="' + path.getAttribute('data-id') + '"]')[0],
          settings = $(this).parent().data('settings');

      if (/start/i.test(e.type)) {
        $(path).siblings('path').each(function () {
          if (this.nodeName) {
            path.setAttribute('transform', 'matrix(1,0,0,1,0,0)');
            $(this).next()[0].setAttribute('fill-opacity', 0);
          }
        });
      }

      if (/enter|start/i.test(e.type)) {
        path.setAttribute('transform', 'matrix(1.05, 0, 0, 1.05, -5.1, -5.1)');

        if (settings.show_text) {
          text.setAttribute('fill-opacity', 1);
        }
      } else {
        path.setAttribute('transform', 'matrix(1,0,0,1,0,0)');
        text.setAttribute('fill-opacity', 1);
      }
    });
  },

  build : function(legend, options) {
    legend.data('settings', $.extend({}, this.settings, options, legend.data('options')));

    this.data(legend, options || {});

    if (legend.data('pie-id')) {
      this.update_DOM(this.pie(legend));
    } else if (legend.data('line-id')) {
      this.update_DOM(this.line(legend));
    } else if (legend.data('bar-id')) {
      this.update_DOM(this.bar(legend));
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
    $(el).hover(function (e) {
      var path = e.target,
          text = $(path).parent().find('text[data-id="' + path.getAttribute('data-id') + '"]')[0];

      var scaling = 1.05,
          sx = cx - scaling * cx,
          sy = cy - scaling * cy;

      $(path).parent()[0].setAttribute('transform', 'matrix(1.05, 0, 0, 1.05,'+sx+','+sy +')')
      text.setAttribute('fill-opacity', 1);

    }, function (e) {
      var path = e.target,
          text = $(path).parent()
            .find('text[data-id="' + path.getAttribute('data-id') + '"]')[0];
      $(path).parent()[0].setAttribute('transform', 'matrix(1, 0, 0, 1, 0, 0)')
      // path.setAttribute('transform', 'matrix(1,0,0,1,0,0)');
      text.setAttribute('fill-opacity', 0);

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
      svg = svg[0];
    } else {
      var svg = this.svg_obj('svg');
      svg.width = width;
      svg.height = height;
    }

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '-' + settings.percent_offset + ' -' + settings.percent_offset + ' ' + 
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

  transform : function(point, matrix) {
    var x, y;
    x = point.x;
    y = point.y;
    return {x:matrix.a * x + matrix.c * y + matrix.e,y: matrix.b * x + matrix.d * y + matrix.f};
  },

  svg_obj : function (type) {
    return document.createElementNS(this.NS, type);
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

function Matrix(a, b, c, d, e, f) {
    if (b == null && Object.prototype.toString.call(a) == "[object SVGMatrix]") {
        this.a = a.a;
        this.b = a.b;
        this.c = a.c;
        this.d = a.d;
        this.e = a.e;
        this.f = a.f;
        return;
    }
    if (a != null) {
        this.a = +a;
        this.b = +b;
        this.c = +c;
        this.d = +d;
        this.e = +e;
        this.f = +f;
    } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
    }
}