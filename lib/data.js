'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = createData;

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _lodash = require('lodash');

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

var _buffer = require('./buffer');

var _buffer2 = _interopRequireDefault(_buffer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var raw = void 0;
try {
  var persistence = fs.readFileSync(__dirname + '/pers.json');
  persistence = JSON.parse(persistence.toString("utf8"));
  raw = persistence;
} catch (e) {
  raw = {};
}

setInterval(function () {
  fs.writeFile(__dirname + '/pers.json', JSON.stringify(raw), function (err) {});
}, 1000);

function createData(expires) {
  var initial = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var keyPrefix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

  var prefix = keyPrefix;
  // let raw = {};

  var data = Object.freeze({
    clear: function clear() {
      // raw = {};
    },
    delete: function _delete(key) {
      if (expires.has(key)) {
        expires.delete(key);
      }
      delete raw['' + prefix + key];
    },
    get: function get(key) {
      if (expires.has(key) && expires.isExpired(key)) {
        this.delete(key);
      }

      var value = raw['' + prefix + key];

      if (Array.isArray(value)) {
        return value.slice();
      }

      if (Buffer.isBuffer(value)) {
        return (0, _buffer2.default)(value);
      }

      if (value instanceof _es6Set2.default) {
        return new _es6Set2.default(value);
      }

      if (value instanceof _es6Map2.default) {
        return new _es6Map2.default(value);
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value) {
        return (0, _lodash.assign)({}, value);
      }

      return value;
    },
    has: function has(key) {
      if (expires.has(key) && expires.isExpired(key)) {
        this.delete(key);
      }

      return {}.hasOwnProperty.call(raw, '' + prefix + key);
    },
    keys: function keys() {
      return Object.keys(raw);
    },
    set: function set(key, val) {
      var item = val;

      if (Array.isArray(val)) {
        item = val.slice();
      } else if (Buffer.isBuffer(val)) {
        item = (0, _buffer2.default)(val);
      } else if (val instanceof _es6Set2.default) {
        item = new _es6Set2.default(val);
      } else if (val instanceof _es6Map2.default) {
        item = new _es6Map2.default(val);
      } else if ((typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object' && val) {
        item = (0, _lodash.assign)({}, val);
      }

      raw['' + prefix + key] = item;
    }
  });

  Object.keys(initial).forEach(function (key) {
    return data.set(key, initial[key]);
  });

  return data;
}