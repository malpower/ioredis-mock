'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unlink = unlink;

var _del = require('./del');

function unlink() {
  var removeKeys = _del.del.bind(this);
  return removeKeys.apply(undefined, arguments);
}