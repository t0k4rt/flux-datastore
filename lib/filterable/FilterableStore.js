"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilterableStore = undefined;

var _BaseStore = require("../BaseStore");

var _BaseStore2 = _interopRequireDefault(_BaseStore);

var _lodash = require("lodash.debounce");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var _defaultFilterFunction = function _defaultFilterFunction(value, key) {
  var result = false;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this.filterKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var field = _step.value;

      var valueLowered = null;

      // Lower string or object
      if (value.get(field)) {
        if (typeof value.get(field) == 'string') {
          valueLowered = value.get(field).toLowerCase();
        } else if (_typeof(value.get(field)) == 'object') {
          valueLowered = value.get(field).map(function (value) {
            return value.toLowerCase();
          });
        }
      }

      if (valueLowered && valueLowered.indexOf(this.filterStr.toLowerCase()) > -1) {
        result = true;
        break;
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return result;
};

var FilterableStore = exports.FilterableStore = function FilterableStore(ComposedStore) {
  return (function (_ComposedStore) {
    _inherits(_class, _ComposedStore);

    function _class(record, constants, __dispatcher, sync) {
      _classCallCheck(this, _class);

      // is filterable flag

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, record, constants, __dispatcher, sync));

      _this.isFilterable = true;

      _this.events = Object.assign(_this.events, { filter: 'filter' });
      _this.triggerFilterAt = 3;
      _this.filterStr = "";
      _this.filterKeys = [];
      _this.filterFunction = _defaultFilterFunction;
      _this.__filtering = false;
      _this.__debouncedelay = 300;

      // debounced emitfilter, it's easier than debouncing filter function
      _this.__emitFilter = (0, _lodash2.default)(function () {
        if (this.filterStr.length > 0) {
          this.emit(this.events.filter);
        }
      }, _this.__debouncedelay).bind(_this);

      _this.addListener("__reset", _this.__resetFilterable);
      return _this;
    }

    _createClass(_class, [{
      key: "__resetFilterable",
      value: function __resetFilterable() {
        this.filterStr = "";
        this.filterKeys = [];
        this.__filtering = false;
      }
    }, {
      key: "__filter",
      value: function __filter(__collection) {
        if (this.__filtering) {
          return __collection.filter(this.filterFunction.bind(this));
        } else {
          return __collection;
        }
      }
    }, {
      key: "__filterPromise",
      value: function __filterPromise(__collection) {
        return Promise.Resolve(this.__filter(__collection));
      }
    }, {
      key: "getFiltered",
      value: function getFiltered() {
        return this.__filter(this.__collection.toSeq());
      }

      /*******************************/
      /** filter collection methods **/
      /*******************************/

    }, {
      key: "filter",
      value: function filter(_ref) {
        var criterion = _ref.criterion;
        var keys = _ref.keys;

        this.filterStr = criterion.toString();
        this.filterKeys = keys;
        if (this.filterStr.length === 0) {
          this.resetFilter();
        } else {
          this.__filtering = true;
          this.__emitFilter();
        }
      }
    }, {
      key: "resetFilter",
      value: function resetFilter() {
        this.__resetFilterable();
        this.emit(this.events.filter);
      }
    }]);

    return _class;
  })(ComposedStore);
};