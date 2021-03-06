'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emitMessage;
function emitMessage(redisMock, channel, message) {
  process.nextTick(function () {
    redisMock.emit('message', channel, message);
  });
}