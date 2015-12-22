"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectableActions = undefined;

var _Actions2 = require("../Actions");

var _Actions3 = _interopRequireDefault(_Actions2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectableActions = exports.SelectableActions = function SelectableActions(ComposedActions) {
  return (function (_Actions) {
    _inherits(_class, _Actions);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
      key: "selectAll",
      value: function selectAll() {
        this.dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.selectAll,
          keys: _keys
        });
      }
    }, {
      key: "deselectAll",
      value: function deselectAll() {
        this.dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.deselectAll,
          keys: _keys
        });
      }
    }, {
      key: "select",
      value: function select(_record) {
        this.dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.select,
          record: _record
        });
      }
    }, {
      key: "deselect",
      value: function deselect(_record) {
        this.dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.deselect,
          record: _record
        });
      }
    }]);

    return _class;
  })(_Actions3.default);
};