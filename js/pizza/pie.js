$.extend(Pizza, {
  pie : function (legend) {
    // pie chart concept from JavaScript the 
    // Definitive Guide 6th edition by David Flanagan
    var settings = legend.data('settings'),
        svg = this.svg(legend, settings),
        data = legend.data('graph-data'),
        total = 0,
        angles = [],
        start_angle = 0,
        container = $(this.identifier(legend)),
        base = container.outerWidth();

    for (var i = 0; i < data.length; i++) {
      total += data[i].value;
    }

    for (var i = 0; i < data.length; i++) {
      angles[i] = data[i].value / total * Math.PI * 2;
    }

    if(angles.length == 1) angles[0] = Math.PI * 2 - 0.0001; // if 1

    for (var i = 0; i < data.length; i++) {
      var end_angle = start_angle + angles[i];
      var cx = (base / 2),
          cy = (base / 2),
          r = ((base / 2) * 0.85);

      if (!settings.donut) {
        // Compute the two points where our wedge intersects the circle
        // These formulas are chosen so that an angle of 0 is at 12 o'clock
        // and positive angles increase clockwise
        var x1 = cx + r * Math.sin(start_angle);
        var y1 = cy - r * Math.cos(start_angle);
        var x2 = cx + r * Math.sin(end_angle);
        var y2 = cy - r * Math.cos(end_angle);

        // This is a flag for angles larger than than a half circle
        // It is required by the SVG arc drawing component
        var big = 0;
        if (end_angle - start_angle > Math.PI) big = 1;

        // This string holds the path details
        var d = "M" + cx + "," + cy +  // Start at circle center
            " L" + x1 + "," + y1 +     // Draw line to (x1,y1)
            " A" + r + "," + r +       // Draw an arc of radius r
            " 0 " + big + " 1 " +      // Arc details...
            x2 + "," + y2 +            // Arc goes to to (x2,y2)
            " Z";                      // Close path back to (cx,cy)
      }

      var existing_path = $('path[data-id="s' + i + '"]', svg);

      if (existing_path.length > 0) {
        var path = existing_path[0];
      } else {
        var path = this.svg_obj('path');
      }

      var percent = (data[i].value / total) * 100.0;

      var existing_text = $('text[data-id="s' + i + '"]', svg);

      if (existing_text.length > 0) {
        var text = existing_text[0];

        text.setAttribute('x', cx + (r + settings.percent_offset) * Math.sin(start_angle + (angles[i] / 2)));
        text.setAttribute('y', cy - (r + settings.percent_offset) * Math.cos(start_angle + (angles[i] / 2)));

      } else {

        if (data[i].text) {
          var visible_text = this.parse_options(data[i].text, percent, data[i].value);
        } else {
          var visible_text = Math.round(percent) + '%';
        }
        var text = this.svg_obj('text');

        text.setAttribute('x', cx + (r + settings.percent_offset) * Math.sin(start_angle + (angles[i] / 2)));
        text.setAttribute('y', cy - (r + settings.percent_offset) * Math.cos(start_angle + (angles[i] / 2)));
        text.textContent = visible_text;
      }

      text.setAttribute('text-anchor', 'middle');

      if (settings.always_show_text) {
        Snap(text).animate({
          opacity: 1
        }, settings.animation_speed);
      } else {
        Snap(text).attr({
          opacity: 0
        }, settings.animation_speed);
      }

      text.setAttribute('data-id', 's' + i);

      if (settings.donut) {
        this.annular_sector(path, {
          centerX:cx, centerY:cy,
          startDegrees:start_angle, endDegrees:end_angle,
          innerRadius: (r * settings.donut_inner_ratio), outerRadius:r
        });
      } else {
        path.setAttribute('d', d);
      }

      this.set_attr(path, {
        fill: data[i].color,
        stroke: settings.stroke_color,
        'strokeWidth': settings.stroke_width,
        'data-cx' : cx,
        'data-cy' : cy,
        'data-id' : 's' + i
      });

      var existing_group = $('g[data-id=g' + i + ']', svg);

      if (existing_group.length < 1) {
        var g = this.svg_obj('g');

        g.setAttribute('data-id', 'g' + i);
        g.appendChild(path);
        g.appendChild(text);
        svg.appendChild(g);

        this.animate(Snap(path), cx, cy, settings);
      }

      // The next wedge begins where this one ends
      start_angle = end_angle;
    }

    return [legend, svg];
  },

  annular_sector : function (path, options) {
    var opts = optionsWithDefaults(options);

    var p = [ // points
      [opts.cx + opts.r2*Math.sin(opts.startRadians),
       opts.cy - opts.r2*Math.cos(opts.startRadians)],
      [opts.cx + opts.r2*Math.sin(opts.closeRadians),
       opts.cy - opts.r2*Math.cos(opts.closeRadians)],
      [opts.cx + opts.r1*Math.sin(opts.closeRadians),
       opts.cy - opts.r1*Math.cos(opts.closeRadians)],
      [opts.cx + opts.r1*Math.sin(opts.startRadians),
       opts.cy - opts.r1*Math.cos(opts.startRadians)],
    ];

    var angleDiff = opts.closeRadians - opts.startRadians;
    var largeArc = (angleDiff % (Math.PI*2)) > Math.PI ? 1 : 0;
    var cmds = [];
    cmds.push("M"+p[0].join());                                // Move to P0
    cmds.push("A"+[opts.r2,opts.r2,0,largeArc,1,p[1]].join()); // Arc to  P1
    cmds.push("L"+p[2].join());                                // Line to P2
    cmds.push("A"+[opts.r1,opts.r1,0,largeArc,0,p[3]].join()); // Arc to  P3
    cmds.push("z");                                // Close path (Line to P0)
    path.setAttribute('d',cmds.join(' '));

    function optionsWithDefaults(o){
      // Create a new object so that we don't mutate the original
      var o2 = {
        cx           : o.centerX || 0,
        cy           : o.centerY || 0,
        startRadians : (o.startDegrees || 0),
        closeRadians : (o.endDegrees   || 0),
      };

      var t = o.thickness!==undefined ? o.thickness : 100;
      if (o.innerRadius!==undefined)      o2.r1 = o.innerRadius;
      else if (o.outerRadius!==undefined) o2.r1 = o.outerRadius - t;
      else                                o2.r1 = 200           - t;
      if (o.outerRadius!==undefined)      o2.r2 = o.outerRadius;
      else                                o2.r2 = o2.r1         + t;

      if (o2.r1<0) o2.r1 = 0;
      if (o2.r2<0) o2.r2 = 0;

      return o2;
    }
  },

  pie_events : function () {
    $(this.scope).on('mouseenter.pizza mouseleave.pizza touchstart.pizza', '[data-pie-id] li', function (e) {
      var parent = $(this).parent(),
          path = $('#' + parent.attr('data-pie-id') + ' path[data-id="s' + $(this).index() + '"]')[0],
          text = path.nextSibling,
          settings = $(this).parent().data('settings');

      if (/start/i.test(e.type)) {
        $(path).siblings('path').each(function () {
          if (this.nodeName) {
            Snap(path).animate({
              transform: 's1 1 ' + path.getAttribute('data-cx') + ' ' + path.getAttribute('data-cy')
            }, settings.animation_speed, mina[settings.animation_type]);
            Snap($(this).next()[0]).animate({
              opacity: 0
            }, settings.animation_speed);
          }
        });
      }

      if (/enter|start/i.test(e.type)) {
        Snap(path).animate({
          transform: 's1.05 1.05 ' + path.getAttribute('data-cx') + ' ' + path.getAttribute('data-cy')
        }, settings.animation_speed, mina[settings.animation_type]);

        if (settings.show_text) {
          Snap(text).animate({
            opacity: 1
          }, settings.animation_speed);
        }
      } else {
        Snap(path).animate({
          transform: 's1 1 ' + path.getAttribute('data-cx') + ' ' + path.getAttribute('data-cy')
        }, settings.animation_speed, mina[settings.animation_type]);
        Snap(text).animate({
          opacity: 0
        }, settings.animation_speed);
      }
    });
  }
});