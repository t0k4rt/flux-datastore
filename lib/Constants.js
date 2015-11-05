"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Constants = (function () {
  function Constants(namespace, actions) {
    _classCallCheck(this, Constants);

    this.namespace = namespace;

    // _actions
    this.actions = Object.assign({
      create: "create",
      update: "update",
      delete: "delete",
      filter: "filter",
      resetFilter: "reset_filter",
      sort: "sort",
      resetSort: "reset_sort",
      reverse: "reverse"
    }, actions);
  }

  _createClass(Constants, [{
    key: "updateDict",
    value: function updateDict() {
      this.__dict = _immutable2.default.Map(this.actions).flip();
    }
  }, {
    key: "actions",
    set: function set(obj) {
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          obj[prop] = this.namespace + obj[prop];
        }
      }
      if (Object.keys(obj).length > 0) {
        this._actions = obj;
        this.updateDict();
      }
    },
    get: function get() {
      return this._actions;
    }
  }]);

  return Constants;
})();

exports.default = Constants;