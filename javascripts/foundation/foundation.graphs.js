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
      Foundation.inherit(this, 'data_options');

      if (typeof method === 'object') {
        $.extend(true, this.settings, method);
      }

      this.build($('[data-graph]'));

      if (typeof method !== 'string') {
        if (!this.settings.init) { this.events(); }

        return this.settings.init;
      } else {
        return this[method].call(this, options);
      }
    },

    events : function () {
      var self = this;

      // resize event, etc...
    },

    build : function(legends) {
      var self = this;

      legends.each(function () {
        var legend = $(this), graph;
        
        self.data(legend);

        if (/pie/i.test(legend.data('graph'))) {
          return self.update_DOM(self.pie(legend));
        }

        return self.bar(legend);
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

      legend.find('li').each(function () {
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
          html = '<div class="graph-container">' + this.xml_to_string(legend[0]) + '<div class="graph">' + this.xml_to_string(graph) + '</div></div>';

      legend.replaceWith($.parseHTML(html));
    },

    pie : function (legend) {
      var svg = this.svg(legend),
          data = legend.data('graph-data'),
          total = 0,
          angles = [],
          start_angle = 0,
          base = data.graph_size().y;

      for (var i = 0; i < data.length; i++) {
        total += data[i].value;
      }

      for (var i = 0; i < data.length; i++) {
        angles[i] = data[i].value / total * Math.PI * 2;
      }

      for(var i = 0; i < data.length; i++) {
        var end_angle = start_angle + angles[i];
        var cx = base / 2,
            cy = base / 2,
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
        svg.appendChild(path);                // Add wedge to chart

        // The next wedge begins where this one ends
        start_angle = end_angle;
      }

      return [legend, svg];
    },

    svg : function (legend) {
      this.svgns = "http://www.w3.org/2000/svg";
      var graph = document.createElementNS(this.svgns, "svg"),
          size = legend.data('graph-data').graph_size();

      graph.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      graph.setAttribute('version', '1.1');
      graph.setAttribute("width", size.y);
      graph.setAttribute("height", size.y);
      graph.setAttribute("viewBox", "0 0 " + size.y + " " + size.y);

      return graph;
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

    off : function () {},

    reflow : function () {}
  };

  Array.prototype.graph_size = function() {
    return Foundation.libs.graphs.size(this[0].segment.parent());
  };

}(Foundation.zj, this, this.document));