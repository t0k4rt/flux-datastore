"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ErrorActions = (function () {
  function ErrorActions(_constants, _dispatcher) {
    _classCallCheck(this, ErrorActions);

    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  _createClass(ErrorActions, [{
    key: "create",
    value: function create(_record) {
      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: _record
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
        type: this.constants.actions.clear
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

  return ErrorActions;
})();

exports.default = ErrorActions;