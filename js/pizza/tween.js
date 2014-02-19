Pizza = Pizza || {};

// Generate unique IDs for each animation and store them on the el.
Pizza.uuid = {
  unique : 0,
  prefix : "P" + (+new Date).toString(36),
  new : function () {
    return this.prefix + (this.unique++).toString(36);
  }
};

Pizza.anim = function (el, property, to, from, duration, easing, callback) {
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

Pizza.anim.tween = {};

$.extend(Pizza.anim.tween, {

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

  now : function () { return (+ new Date) },

  equal : function (a, b) {
    return a == b;
  },

  init : function () {
    if (this.equal(this.progress, this.to)) return this.callback();

    this.elapsed = this.now() - this.start_time();
    this.percent = this.elapsed / this.duration;

    this.update_frame();

    return this.rAF(this.init.bind(this));
  },

  update_frame : function () {
    if (this.progress < this.to) {
      this.progress = this.easing.call(this, this.percent, this.elapsed, this.from, this.to, this.duration);
    } else {
      this.progress = this.to;
    }
  },

  ease : {
    linear : function (x,t,b,c,d) {
      return b + c * x;
    },
    elastic : function (x, t, b, c, d) {
      var s=1.70158;var p=0;var a=c;
      if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
      if (a < Math.abs(c)) { a=c; var s=p/4; }
      else var s = p/(2*Math.PI) * Math.asin (c/a);
      if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    }
  }
});

Element.prototype.ptween = Pizza.anim.tween;
Element.prototype.tweens = {};

// TODO:
// - allow passing of opacity and matrix for animation
// - break down matrix into values and fire invidual animations on each matrix value per node
