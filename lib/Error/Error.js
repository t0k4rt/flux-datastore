"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ErrorActions = require('./ErrorActions');

var _ErrorActions2 = _interopRequireDefault(_ErrorActions);

var _ErrorStore = require('./ErrorStore');

var _ErrorStore2 = _interopRequireDefault(_ErrorStore);

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
  clear: "clear"
});

var d = new _flux.Dispatcher();

var ErrorRecord = new _Record2.default({ message: null, ttl: 2000 });

exports.default = {
  ErrorRecord: ErrorRecord,
  ErrorStore: new _ErrorStore2.default(ErrorRecord, errorConstants, d),
  ErrorActions: new _ErrorActions2.default(errorConstants, d)
};