Pizza = Pizza || {};

// matrix scale tweening
Pizza.scale = function (node, s, duration, easing, cx, cy) {
  var origin  = [1, 0, 0,
                 1, 0, 0],
      current = Pizza.scale.parse(node.getAttribute('transform'));

  function updateTransform(arr) {
    arr[1] = 0;
    arr[2] = 0;
    arr[4] = cx - arr[0] * cx;
    arr[5] = cy - arr[0] * cy;

    console.log(arr)

    node.setAttribute('transform', ['matrix('].concat(arr.join(',')).concat(')').join(''));
  }

  Pizza.anim(node, s, current[i], duration, easing, 
    function (progress, complete) {
      current[0] = progress;
      current[3] = progress;
      updateTransform(current);
    });

};

// opacity tweening
Pizza.animocity = function (node, to) {

};

Pizza.scale.parse = function (matrix_str) {
  var parts = matrix_str.replace(/^.*\((.*)\)$/g, "$1").split(/, +/),
      array = parts.map(Number);

  return array;
};

// Generate unique IDs for each animation and store them on the el.
Pizza.uuid = {
  unique : 0,
  prefix : "P" + (+new Date).toString(36),
  new : function () {
    return this.prefix + (this.unique++).toString(36);
  }
};

Pizza.anim = function (el, to, from, duration, easing, callback) {
  var uuid = Pizza.uuid.new();

  el.tweens[uuid] = $.extend({}, el.ptween);

  var t = el.tweens[uuid];

  t.to = to;
  t.from = from || 0;
  t.easing = (easing) ? t.ease[easing] : t.ease.linear;
  t.callback = callback || function () {};
  t.duration = (duration || 500);
  t.progress = 0;
  t.start_time = function () {
    t._time = t._time || (+new Date);
    return t._time;
  };

  t.init();
};

Pizza.anim.tween = {

  rAF : function (cb) {
    return  window.requestAnimationFrame(cb)       ||
            window.webkitRequestAnimationFrame(cb) ||
            window.mozRequestAnimationFrame(cb)    ||
            window.oRequestAnimationFrame(cb)      ||
            window.msRequestAnimationFrame(cb)     ||
            function (cb) {
              setTimeout(cb, 16);
            };
  },

  now : function () { 
    return (+ new Date);
  },

  equal : function (a, b) {
    return a == b;
  },

  init : function () {
    if (this.equal(this.progress, this.to)) return this.callback(this.progress, true);

    this.elapsed = this.now() - this.start_time();
    this.percent = this.elapsed / this.duration;

    this.update_frame();

    return this.rAF(this.init.bind(this));
  },

  update_frame : function () {
    if (this.progress < this.to) {
      this.progress = this.easing.call(this, 
        this.percent, 
        this.elapsed, 
        this.from, 
        this.to, 
        this.duration);
    } else {
      this.progress = this.to;
    }
    this.callback(this.progress);
  },

  ease : {
    linear : function (x,t,b,c,d) {
      return b + c * x;
    },
    elastic : function (x, t, b, c, d) {
      var s = 1.70158,
          p = 0,
          a = c;

      if (t == 0) return b;
      if ((t/=d/2)==2) return b+c;  
      if (!p) p=d*(.3*1.5);
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin(c/a);
      if (t < 1) {
        return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)) + b;
      }

      return a*Math.pow(2,-10*(t-=1)) * Math.sin((t*d-s)*(2*Math.PI)/p)*.5 + c + b;
    }
  }
};

Element.prototype.ptween = Pizza.anim.tween;
Element.prototype.tweens = {};

// TODO:
// - allow passing of opacity and matrix for animation
// - break down matrix into values and fire invidual animations on each matrix value per node
