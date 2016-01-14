"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SortableActions = exports.SortableActions = function SortableActions(ComposedActions) {
  return (function (_ComposedActions) {
    _inherits(_class, _ComposedActions);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
      key: "sort",
      value: function sort(_keys) {
        this.__dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.sort,
          keys: _keys
        });
      }
    }, {
      key: "resetSort",
      value: function resetSort() {
        this.__dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.resetSort
        });
      }
    }, {
      key: "reverse",
      value: function reverse() {
        this.__dispatcher.dispatch({
          namespace: this.constants.namespace,
          type: this.constants.actions.reverse
        });
      }
    }]);

    return _class;
  })(ComposedActions);
};