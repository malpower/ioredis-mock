'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ltrim = ltrim;
function ltrim(key, s, e) {
  if (this.data.has(key) && !(this.data.get(key) instanceof Array)) {
    throw new Error('Key ' + key + ' does not contain a list');
  }
  var start = parseInt(s, 10);
  var end = parseInt(e, 10);

  var list = this.data.get(key) || [];

  if (start < 0) {
    start = list.length + start;
  }
  if (end < 0) {
    end = list.length + end;
  }

  this.data.set(key, list.slice(start, end + 1));
  return 'OK';
}