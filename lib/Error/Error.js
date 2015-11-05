"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.actions = exports.store = undefined;

var _ErrorActions = require('./ErrorActions');

var _ErrorActions2 = _interopRequireDefault(_ErrorActions);

var _ErrorStore = require('./ErrorStore');

var _ErrorStore2 = _interopRequireDefault(_ErrorStore);

var _Constants = require('../Constants');

var _Constants2 = _interopRequireDefault(_Constants);

var _Record = require('../Record');

var _Record2 = _interopRequireDefault(_Record);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var errorConstants = new _Constants2.default("error", {
  create: "create",
  delete: "delete",
  clear: "clear"
});

var ErrorRecord = new Immutable.Record({ message: null, ttl: 2000 });

var store = exports.store = new _ErrorStore2.default(ErrorRecord, errorConstants);
var actions = exports.actions = new _ErrorActions2.default(errorConstants);