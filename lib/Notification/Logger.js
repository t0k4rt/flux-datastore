"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoggerActions = exports.LoggerStore = undefined;

var _LoggerActions2 = require('./LoggerActions');

var _LoggerActions3 = _interopRequireDefault(_LoggerActions2);

var _LoggerStore2 = require('./LoggerStore');

var _LoggerStore3 = _interopRequireDefault(_LoggerStore2);

var _Constants = require('../Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _LoggerRecord = require('./LoggerRecord');

var _flux = require('flux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _flux.Dispatcher();

var LoggerConstants = new _Constants2.default("error", {
  create: "create",
  delete: "delete",
  dismiss: "dismiss",
  dismissAll: "dismiss_all"
});

var d = new _flux.Dispatcher();
var _LoggerStore = new _LoggerStore3.default(_LoggerRecord.LoggerRecord, LoggerConstants, d);
var _LoggerActions = new _LoggerActions3.default(LoggerConstants, d);

exports.default = {
  LoggerStore: _LoggerStore,
  LoggerActions: _LoggerActions
};
exports.LoggerStore = _LoggerStore;
exports.LoggerActions = _LoggerActions;