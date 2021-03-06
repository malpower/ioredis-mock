'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dispose = exports.init = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fengari = require('fengari');

var _fengari2 = _interopRequireDefault(_fengari);

var _fengariInterop = require('fengari-interop');

var _fengariInterop2 = _interopRequireDefault(_fengariInterop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lua = _fengari2.default.lua,
    lualib = _fengari2.default.lualib,
    lauxlib = _fengari2.default.lauxlib,
    toLuaString = _fengari2.default.to_luastring,
    toJsString = _fengari2.default.to_jsstring;


var luaExecString = function luaExecString(L) {
  return function (str) {
    var retCode = lauxlib.luaL_dostring(L, toLuaString(str));
    if (retCode !== 0) {
      var errorMsg = lua.lua_tojsstring(L, -1);
      var message = 'Error trying to loading or executing lua code string in VM: ' + errorMsg;
      throw new Error(message);
    }
  };
};

// DEBUGGING PRINT TOOL
// const printStack = L => msg => {
//   const output = []
//   output.push(`===== PRINTING STACK: ${msg} =====`)
//   const newTop = lua.lua_gettop(L);
//   output.push(`| newTop ${newTop} |`)
//   let i = newTop * -1;
//   output.push(`STACK ${i}`)
//   while (i < 0) {
//     output.push('-----')
//     output.push(interop.tojs(L, i))
//     output.push('-----')
//     i++;
//   }
//   console.log(output.join('\n'))
// };

var getTopLength = function getTopLength(L) {
  // get length of array in top of the stack
  lua.lua_len(L, -1);
  var length = lua.lua_tointeger(L, -1);
  lua.lua_pop(L, 1);
  return length;
  // ~get length of array in top of the stack
};

var typeOf = function typeOf(L) {
  return function (pos) {
    return toJsString(lua.lua_typename(L, lua.lua_type(L, pos)));
  };
};

var getTopKeys = function getTopKeys(L) {
  if (lua.lua_isnil(L, -1)) throw new Error('cannot get keys on nil');
  if (!lua.lua_istable(L, -1)) throw new Error('non-tables don\'t have keys! type is "' + typeOf(L)(-1) + '"');
  lua.lua_pushnil(L);
  var keys = [];
  while (lua.lua_next(L, -2) !== 0) {
    keys.push(_fengariInterop2.default.tojs(L, -2));
    lua.lua_pop(L, 1);
  }
  return keys;
};

var isTopArray = function isTopArray(L) {
  return function () {
    try {
      var keys = getTopKeys(L);
      // reversing as putting and getting things from the stack ends with everything upside down.
      return keys.reverse().every(function (v, i) {
        return v === i + 1;
      });
    } catch (e) {
      return false;
    }
  };
};

var makeReturnValue = function makeReturnValue(L) {
  var isArray = isTopArray(L)();
  if (!isArray) {
    return _fengariInterop2.default.tojs(L, -1);
  }

  var arrayLength = getTopLength(L);

  var table = _fengariInterop2.default.tojs(L, -1);
  var retVal = [];

  if (arrayLength === 0) {
    lua.lua_pop(L, 1);
    return retVal;
  }

  for (var i = 1; i <= arrayLength; i++) {
    _fengariInterop2.default.push(L, table.get(i));
    retVal.push(makeReturnValue(L));
  }

  lua.lua_pop(L, 1);
  return retVal;
};

var popReturnValue = function popReturnValue(L) {
  return function (topBeforeCall) {
    var numReturn = lua.lua_gettop(L) - topBeforeCall + 1;
    var ret = void 0;
    if (numReturn > 0) {
      ret = makeReturnValue(L);
    }
    lua.lua_settop(L, topBeforeCall);
    return ret;
  };
};

var pushTable = function pushTable(L) {
  return function (obj) {
    lua.lua_newtable(L);
    var index = lua.lua_gettop(L);

    Object.keys(obj).forEach(function (fieldName) {
      _fengariInterop2.default.push(L, fieldName);
      // eslint-disable-next-line no-use-before-define
      push(L)(obj[fieldName]);
      lua.lua_settable(L, index);
    });
  };
};

var pushArray = function pushArray(L) {
  return function (array) {
    lua.lua_newtable(L);
    var subTableIndex = lua.lua_gettop(L);

    array.forEach(function (e, i) {
      _fengariInterop2.default.push(L, i + 1);
      _fengariInterop2.default.push(L, e);
      lua.lua_settable(L, subTableIndex);
    });
  };
};

var push = function push(L) {
  return function (value) {
    if (Array.isArray(value)) {
      pushArray(L)(value);
    } else if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && !Array.isArray(value)) {
      pushTable(L)(value);
    } else {
      _fengariInterop2.default.push(L, value);
    }
  };
};

var defineGlobalArray = function defineGlobalArray(L) {
  return function (array, name) {
    push(L)(array);
    lua.lua_setglobal(L, toLuaString(name));
  };
};

var defineGlobalFunction = function defineGlobalFunction(L) {
  return function (fn, name) {
    // define global fn call
    lua.lua_pushjsfunction(L, fn);
    lua.lua_setglobal(L, toLuaString(name));
  };
};

var extractArgs = function extractArgs(L) {
  return function () {
    var top = lua.lua_gettop(L);
    var args = [];
    var a = -top;
    while (a < 0) {
      args.push(a);
      a += 1;
    }
    return args.map(function (i) {
      return _fengariInterop2.default.tojs(L, i);
    });
  };
};

var init = exports.init = function init() {
  // init fengari
  var L = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(L);
  _fengariInterop2.default.luaopen_js(L);
  return {
    L: L,
    defineGlobalFunction: defineGlobalFunction(L),
    defineGlobalArray: defineGlobalArray(L),
    luaExecString: luaExecString(L),
    extractArgs: extractArgs(L),
    popReturnValue: popReturnValue(L),
    utils: {
      isTopArray: isTopArray(L),
      push: push(L)
    }
  };
};

var dispose = exports.dispose = function dispose(vm) {
  var L = vm.L || vm;
  lua.lua_close(L);
};