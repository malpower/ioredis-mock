'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.del = del;

var _keyspaceNotifications = require('../keyspace-notifications');

function del() {
  var _this = this;

  var deleted = 0;

  for (var _len = arguments.length, keys = Array(_len), _key = 0; _key < _len; _key++) {
    keys[_key] = arguments[_key];
  }

  keys.forEach(function (key) {
    if (_this.data.has(key)) {
      deleted++;
      (0, _keyspaceNotifications.emitNotification)(_this, 'g', key, 'del');
    }
    _this.data.delete(key);
  });
  return deleted;
}