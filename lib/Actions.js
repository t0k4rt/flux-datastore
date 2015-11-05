"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Actions = (function () {
  function Actions(_constants, _dispatcher) {
    _classCallCheck(this, Actions);

    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  _createClass(Actions, [{
    key: "create",
    value: function create(_record) {
      this.dispatcher.dispatch({
        type: this.constants.actions.create,
        record: _record
      });
    }
  }, {
    key: "update",
    value: function update(_record) {
      this.dispatcher.dispatch({
        type: this.constants.actions.update,
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
    key: "filter",
    value: function filter(_criterion, _keys) {
      this.dispatcher.dispatch({
        type: this.constants.actions.filter,
        criterion: _criterion,
        keys: _keys
      });
    }
  }, {
    key: "resetFilter",
    value: function resetFilter() {
      this.dispatcher.dispatch({
        type: this.constants.actions.resetFilter
      });
    }
  }, {
    key: "sort",
    value: function sort(_keys) {
      this.dispatcher.dispatch({
        type: this.constants.actions.sort,
        keys: _keys
      });
    }
  }, {
    key: "resetSort",
    value: function resetSort() {
      this.dispatcher.dispatch({
        type: this.constants.actions.resetSort
      });
    }
  }, {
    key: "reverse",
    value: function reverse() {
      this.dispatcher.dispatch({
        type: this.constants.actions.reverse
      });
    }
  }]);

  return Actions;
})();

exports.default = Actions;