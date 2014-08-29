var Pizza = {
  version : '0.2.1',

  settings : {
    donut: false,
    donut_inner_ratio: 0.4,   // between 0 and 1
    percent_offset: 35,       // relative to radius
    show_text: true,       // show or hide the percentage on the chart.
    animation_speed: 500,
    always_show_text: false,
    show_grid: true,
    bar_spacer: 100,
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

    $(this.scope).off('.pizza');

    this.pie_events();
    this.line_events();
    this.bar_events();
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

  animate : function (el, cx, cy, settings, scale) {
    var self = this,
        scale = scale || 1.05;

    el.hover(function (e) {
        var path = Snap(e.target),
            text = Snap(path.node.nextSibling);

        path.animate({
          transform: 's' + scale + ' ' + scale + ' ' + cx + ' ' + cy
        }, settings.animation_speed, mina[settings.animation_type]);

        if (!/text/.test(text.node.nodeName)) return;

        text.touchend(function () {
          Snap(path).animate({
            transform: 's' + scale + ' ' + scale + ' ' + cx + ' ' + cy
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
            text = Snap(path.node.nextSibling);

        path.animate({
          transform: 's1 1 ' + cx + ' ' + cy
        }, settings.animation_speed, mina[settings.animation_type]);

        if (!/text/.test(text.node.nodeName)) return;

        text.animate({
          opacity: 0
        }, settings.animation_speed);
      });

  },

  parse_options : function (string, percent, value) {
    var percentStr = Math.round(percent) + '%',
        output = string.replace(/{{ *percent *}}/ig, percentStr)
                       .replace(/{{ *value *}}/ig, value);

    return output;
  },

  svg : function (legend, settings) {
    var container = $(this.identifier(legend)),
        svg = $('svg', container),
        width = container.width(),
        pie = legend.attr('data-pie-id'),
        height = container.height();

    if (svg.length > 0) {
      svg = svg[0];
    } else {
      var svg = this.svg_obj('svg');
      svg.width = width;
      svg.height = height;
    }

    if (pie) {
      var view_box = '-' + settings.percent_offset + ' -' + settings.percent_offset + ' ' + 
      (width + (settings.percent_offset * 1.5)) + ' ' + 
      (width + (settings.percent_offset * 1.5));
    } else {
      var view_box = '-' + settings.percent_offset + ' -' + settings.percent_offset + ' ' + 
      (width + (settings.percent_offset * 1.6)) + ' ' + 
      (height + (settings.percent_offset * 1.6));
    }

    this.set_attr(svg, {width: '100%', height: '100%', viewBox: view_box});

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
  },

  set_attr : function (node, attrs) {

    for (attr in attrs) {
      node.setAttribute(attr, attrs[attr]);
    }

    return this;
  },

  flip : function (node, h) {
    node.setAttribute('transform', 'translate(0, ' + h +') scale(1, -1)');
  }
};