"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PaginableActions = exports.PaginableActions = function PaginableActions(ComposedActions) {
  return function (_ComposedActions) {
    _inherits(_class, _ComposedActions);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: "next",
      value: function next() {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.next
        });
      }
    }, {
      key: "prev",
      value: function prev() {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.prev
        });
      }
    }, {
      key: "first",
      value: function first() {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.first
        });
      }
    }, {
      key: "last",
      value: function last() {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.last
        });
      }
    }, {
      key: "goto",
      value: function goto(_pageNumber) {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.goto,
          pageNumber: _pageNumber
        });
      }
    }, {
      key: "setItemsPerPage",
      value: function setItemsPerPage(_itemsPerPage) {
        this.__dispatcher.dispatch({
          namespace: this.__constants.namespace,
          type: this.__constants.actions.setItemsPerPage,
          itemsPerPage: _itemsPerPage
        });
      }
    }]);

    return _class;
  }(ComposedActions);
};