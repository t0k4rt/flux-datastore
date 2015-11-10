"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorActions = exports.ErrorStore = exports.ErrorRecord = undefined;

var _ErrorActions2 = require('./ErrorActions');

var _ErrorActions3 = _interopRequireDefault(_ErrorActions2);

var _ErrorStore2 = require('./ErrorStore');

var _ErrorStore3 = _interopRequireDefault(_ErrorStore2);

var _Constants = require('../Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _Record = require('../Record');

var _Record2 = _interopRequireDefault(_Record);

var _flux = require('flux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = new _flux.Dispatcher();

var errorConstants = new _Constants2.default("error", {
  create: "create",
  delete: "delete",
  dismiss: "dismiss",
  dismissAll: "dismiss_all"
});

var d = new _flux.Dispatcher();

var ErrorRecord = new _Record2.default({ message: null, ttl: 4000 });
var _ErrorStore = new _ErrorStore3.default(ErrorRecord, errorConstants, d);
var _ErrorActions = new _ErrorActions3.default(errorConstants, d);

exports.default = {
  ErrorRecord: ErrorRecord,
  ErrorStore: _ErrorStore,
  ErrorActions: _ErrorActions
};
exports.ErrorRecord = ErrorRecord;
exports.ErrorStore = _ErrorStore;
exports.ErrorActions = _ErrorActions;