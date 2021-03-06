'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zadd = zadd;

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function zadd(key) {
  // consume options
  var options = [];

  for (var _len = arguments.length, vals = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    vals[_key - 1] = arguments[_key];
  }

  while (['NX', 'XX', 'CH', 'INCR'].includes(vals[0])) {
    options.push(vals.shift());
  }

  // make sure we have the correct number of args
  var elems = vals.length;
  if (elems % 2 !== 0 || elems < 1) throw new Error('ERR syntax error');

  // set option vals
  var nx = options.includes('NX');
  var xx = options.includes('XX');
  var ch = options.includes('CH');
  var incr = options.includes('INCR');

  // validate options
  if (nx && xx) throw new Error('XX and NX options at the same time are not compatible');
  if (incr && elems > 2) throw new Error('INCR option supports a single increment-element pair');

  if (!this.data.has(key)) {
    if (xx) return 0;
    this.data.set(key, new _es6Map2.default());
  }

  var map = this.data.get(key);

  var added = 0;
  var updated = 0;
  for (var i = 0; i < elems; i += 2) {
    var score = Number(vals[i]);
    var value = vals[i + 1];

    if (map.has(value)) {
      if (!nx) {
        if (incr) {
          score += Number(map.get(value).score);
        }
        map.set(value, { score: score, value: value });
        updated++;
      }

      // noop when nx
    } else if (!xx) {
      map.set(value, { score: score, value: value });
      added++;
    }
  }

  this.data.set(key, map);
  return ch ? added + updated : added;
}