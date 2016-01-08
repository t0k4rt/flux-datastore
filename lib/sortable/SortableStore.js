"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SortableStore = undefined;

var _BaseStore = require("../BaseStore");

var _BaseStore2 = _interopRequireDefault(_BaseStore);

var _lodash = require("lodash.debounce");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultSortFunction = function _defaultSortFunction(a, b) {
  var valueA = undefined,
      valueB = undefined;
  if (this.__sortKeys.length > 0) {
    valueA = a.get(this.__sortKeys[0]);
    valueB = b.get(this.__sortKeys[0]);
  } else {
    valueA = a.get("__cid");
    valueB = b.get("__cid");
  }

  if (valueA === valueB) return 0;else return valueA > valueB ? 1 : -1;
};

var SortableStore = exports.SortableStore = function SortableStore(ComposedStore) {
  return (function (_ComposedStore) {
    _inherits(_class, _ComposedStore);

    function _class(record, constants, __dispatcher, sync) {
      _classCallCheck(this, _class);

      // sort

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, record, constants, __dispatcher, sync));

      _this.events = Object.assign(_this.events, { sort: 'sort' });
      _this.__sortKeys = ["id"];
      _this.__reverse = false;
      _this.sortFunction = _defaultSortFunction;
      return _this;
    }

    _createClass(_class, [{
      key: "getSorted",
      value: function getSorted() {
        // always sort collection by id map
        var sortedCollection = this.__collection__.sort(this.sortFunction.bind(this));
        return this.__reverse ? sortedCollection.reverse() : sortedCollection;
      }

      // override __collection getter so that we always get a sorted collection

    }, {
      key: "sort",

      /*****************************/
      /** Sort collection section **/
      /*****************************/
      value: function sort(_ref) {
        var keys = _ref.keys;

        this.resetSort();
        this.__sortKeys = keys || ["id"];
        this.emit(this.events.sort);
      }
    }, {
      key: "resetSort",
      value: function resetSort() {
        this.__sortKeys = [];
        this.__reverse = false;
      }
    }, {
      key: "reverse",
      value: function reverse() {
        this.__reverse = !this.__reverse;
      }
    }, {
      key: "__collection",
      get: function get() {
        return this.getSorted();
      },
      set: function set(collection) {
        this.__collection__ = collection;
      }
    }]);

    return _class;
  })(ComposedStore);
};