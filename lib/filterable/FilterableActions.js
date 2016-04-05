"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FilterableActions = exports.FilterableActions = function FilterableActions(ComposedActions) {
  return (function (_ComposedActions) {
    _inherits(_class, _ComposedActions);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
    }

    _createClass(_class, [{
      key: "filter",
      value: function filter(_criterion, _keys) {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.filter,
          criterion: _criterion,
          keys: _keys
        });
      }
    }, {
      key: "filterMultiple",
      value: function filterMultiple(_criteria) {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.filterMultiple,
          criteria: _criteria
        });
      }
    }, {
      key: "resetFilter",
      value: function resetFilter() {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.resetFilter
        });
      }
    }]);

    return _class;
  })(ComposedActions);
};