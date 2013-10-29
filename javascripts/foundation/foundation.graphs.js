/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs.graphs = {
    name : 'graphs',

    version : '1.0.0',

    settings : {

    },

    init : function (scope, method, options) {
      this.scope = scope || this.scope;
      Foundation.inherit(this, 'data_options throttle');

      if (typeof method === 'object') {
        $.extend(true, this.settings, method);
      }

      this.build($('[data-pie-id], [data-bar-id]'));
      this.events();

      if (typeof method !== 'string') {
        if (!this.settings.init) { this.events(); }

        return this.settings.init;
      } else {
        return this[method].call(this, options);
      }
    },

    events : function () {
      var self = this;

      $(window).on('resize.fndtn.graphs', self.throttle(function () {
        self.build($('[data-pie-id], [data-bar-id]'));
      }, 100));

      $(document).on('mouseenter mouseleave', 'svg path', function (e) {
        e.preventDefault();
        self.animate.call(this, e);
      });
    },

    build : function(legends) {
      var self = this;

      legends.each(function () {
        var legend = $(this), graph;
        self.data(legend);

        if (legend.data('bar-id')) {
          return self.update_DOM(self.bar(legend));
        }

        return self.update_DOM(self.pie(legend));
      });
    },

    size : function (legend) {
      return {
        x: legend.outerWidth(),
        y: legend.outerHeight()
      };
    },

    data : function (legend) {
      var data = [],
          count = 0;

      $('li', legend).each(function () {
        var segment = $(this);

        data.push({
          value: segment.data('value'), 
          color: segment.css('color'),
          segment: segment
        });
      });

      return legend.data('graph-data', data);
    },

    update_DOM : function (parts) {
      var legend = parts[0],
          graph = parts[1],
          html = '<div class="graph">' + this.xml_to_string(graph) + '</div>';

      return $(this.identifier(legend)).html($.parseHTML(html));
    },

    pie : function (legend) {
      var svg = this.svg(legend),
          data = legend.data('graph-data'),
          total = 0,
          angles = [],
          start_angle = 0,
          base = $(this.identifier(legend)).width() / 1.15;

      for (var i = 0; i < data.length; i++) {
        total += data[i].value;
      }

      for (var i = 0; i < data.length; i++) {
        angles[i] = data[i].value / total * Math.PI * 2;
      }

      for (var i = 0; i < data.length; i++) {
        var end_angle = start_angle + angles[i];
        var cx = (base / 2) + 5,
            cy = (base / 2) + 5,
            r = (base / 2) - 2;

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

        // We describe a wedge with an <svg:path> element
        // Notice that we create this with createElementNS()
        var path = document.createElementNS(this.svgns, "path");

        // This string holds the path details
        var d = "M" + cx + "," + cy +  // Start at circle center
            " L" + x1 + "," + y1 +     // Draw line to (x1,y1)
            " A" + r + "," + r +       // Draw an arc of radius r
            " 0 " + big + " 1 " +       // Arc details...
            x2 + "," + y2 +             // Arc goes to to (x2,y2)
            " Z";                       // Close path back to (cx,cy)

        // Now set attributes on the <svg:path> element
        path.setAttribute("d", d);              // Set this path 
        path.setAttribute("fill", data[i].color);   // Set wedge color
        path.setAttribute("stroke", "#333");   // Outline wedge in black
        path.setAttribute("stroke-width", "2"); // 2 units thick
        path.setAttribute('data-id', 's' + i);
        svg.appendChild(path);                // Add wedge to chart

        // The next wedge begins where this one ends
        start_angle = end_angle;
      }

      return [legend, svg];
    },

    bar : function (legend) {
      var svg = this.svg(legend),
          data = legend.data('graph-data'),
          current_offset = 0,
          base = data.graph_size().y,
          spacer = 5,
          max = 0,
          total = 0,
          interval = (base - (data.length * spacer)) / data.length;

      for (var i = 0; i < data.length; i++) {
        if (max < data[i].value) max = data[i].value;
        total += data[i].value;
      }

      var g = document.createElementNS(this.svgns, "g");

      g.setAttribute('transform', 'translate(0, ' + max +') scale(1, -1)');

      for (var i = 0; i < data.length; i++) {
        var y = base * (data[i].value / base),
            rect = document.createElementNS(this.svgns, "rect");

        if (current_offset === 0) {
          var new_offset = current_offset;
        } else {
          var new_offset = current_offset + spacer;
        }

        rect.setAttribute('x', new_offset);
        rect.setAttribute('y', 0);
        rect.setAttribute('width', interval);
        rect.setAttribute('height', y);
        rect.setAttribute('fill', data[i].color);
        rect.setAttribute('stroke', '#222222');
        rect.setAttribute('stroke-width', 2);

        current_offset = new_offset + interval;

        g.appendChild(rect);
      }

      svg.appendChild(g);

      return [legend, svg];
    },

    animate : function (e) {
      if (/enter/i.test(e.type)) {
        return this.setAttribute('transform', 'translate(-3,-3) scale(1.05)');
      }

      return this.setAttribute('transform', 'translate(0,0) scale(1)');
    },

    svg : function (legend) {
      this.svgns = "http://www.w3.org/2000/svg";
      var graph = document.createElementNS(this.svgns, "svg"),
          size = $(this.identifier(legend)).width();

      graph.setAttribute("width", size);
      graph.setAttribute("height", size);

      return graph;
    },

    identifier : function (legend) {
      if (legend.data('pie-id').length > 0 ) {
        return '#' + legend.data('pie-id');
      }
      
      return '#' + legend.data('bar-id');
    },

    xml_to_string : function (xmlData) {
      var xmlString;
      //IE
      if (window.ActiveXObject){
        xmlString = xmlData.xml;
      }
      // code for Mozilla, Firefox, Opera, etc.
      else {
        xmlString = (new XMLSerializer()).serializeToString(xmlData);
      }
      return xmlString;
    },

    reflow : function () {
      this.build($('[data-graph]'));
    }
  };

  Array.prototype.graph_size = function() {
    return Foundation.libs.graphs.size(this[0].segment.parent());
  };

}(Foundation.zj, this, this.document));