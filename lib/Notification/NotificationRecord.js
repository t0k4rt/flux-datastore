"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.levels = exports.NotificationRecord = undefined;

var _Record = require('../Record');

var _Record2 = _interopRequireDefault(_Record);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var levels = {
  EMERGENCY: 'emergency',
  ALERT: 'alert',
  CRITICAL: 'critical',
  ERROR: 'error',
  WARNING: 'warning',
  NOTICE: 'notice',
  INFO: 'info',
  DEBUG: 'debug'
};

var NotificationRecord = new _Record2.default({ level: levels.DEBUG, message: null, context: {}, ttl: 4000 });

exports.NotificationRecord = NotificationRecord;
exports.levels = levels;
exports.default = NotificationRecord;