"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _LoggerRecord = require("./LoggerRecord");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LoggerActions = (function () {
  function LoggerActions(_constants, _dispatcher) {
    _classCallCheck(this, LoggerActions);

    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  _createClass(LoggerActions, [{
    key: "log",
    value: function log(_level, _message) {
      var _context = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _level, message: _message, context: _context })
      });
    }
  }, {
    key: "debug",
    value: function debug(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.DEBUG, message: _message, context: _context })
      });
    }
  }, {
    key: "info",
    value: function info(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.INFO, message: _message, context: _context })
      });
    }
  }, {
    key: "notice",
    value: function notice(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.NOTICE, message: _message, context: _context })
      });
    }
  }, {
    key: "warning",
    value: function warning(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.WARNING, message: _message, context: _context })
      });
    }
  }, {
    key: "error",
    value: function error(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.ERROR, message: _message, context: _context })
      });
    }
  }, {
    key: "critical",
    value: function critical(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.CRITICAL, message: _message, context: _context })
      });
    }
  }, {
    key: "emergency",
    value: function emergency(_message) {
      var _context = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: new _LoggerRecord.LoggerRecord({ level: _LoggerRecord.levels.EMERGENCY, message: _message, context: _context })
      });
    }
  }, {
    key: "delete",
    value: function _delete(_record) {
      this.dispatcher.dispatch({
        type: this.constants.actions.delete,
        record: _record
      });
    }
  }, {
    key: "dismissAll",
    value: function dismissAll() {
      this.dispatcher.dispatch({
        type: this.constants.actions.dismissAll
      });
    }
  }, {
    key: "dismiss",
    value: function dismiss(record) {
      this.dispatcher.dispatch({
        type: this.constants.actions.dismiss,
        record: record
      });
    }
  }]);

  return LoggerActions;
})();

exports.default = LoggerActions;