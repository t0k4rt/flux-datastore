"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilterableStore = undefined;

var _BaseStore2 = require("../BaseStore");

var _BaseStore3 = _interopRequireDefault(_BaseStore2);

var _lodash = require("lodash.debounce");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultFilterFunction = function _defaultFilterFunction(value, key) {
  var result = false;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this.filterKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var field = _step.value;

      if (value.get(field).indexOf(this.filterStr) > -1) {
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
  return (function (_BaseStore) {
    _inherits(_class, _BaseStore);

    function _class(record, constants, __dispatcher, sync) {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, record, constants, __dispatcher, sync));

      _this.events = Object.assign(_this.events, { filter: 'filter' });
      _this.triggerFilterAt = 3;
      _this.filterStr = "";
      _this.filterKeys = [];
      _this.filterFunction = _defaultFilterFunction;
      _this.__filteredCollection;
      _this.__filtering = false;
      _this.__debouncedelay = 200;
      return _this;
    }

    _createClass(_class, [{
      key: "getFiltered",
      value: function getFiltered() {
        console.log("isfiltering", this.__filtering);
        if (this.__filtering) {
          return this.__collection.filter(this.filterFunction.bind(this));
        } else {
          return this.getAll();
        }
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
        if (this.__filtering === true && this.filterStr.length === 0) {
          this.resetFilter();
        } else if (this.filterStr.length > 0) {
          this.emit(this.events.filter);
          this.__filtering = true;
        }
      }
    }, {
      key: "debouncedFilter",
      value: function debouncedFilter(_ref2) {
        var criterion = _ref2.criterion;
        var keys = _ref2.keys;

        var debounced = (0, _lodash2.default)(function (criterion, keys) {
          this.filter({ criterion: criterion, keys: keys });
        }, this.__debouncedelay).bind(this);

        debounced.call(this, criterion, keys);
      }
    }, {
      key: "resetFilter",
      value: function resetFilter() {
        this.filterStr = "";
        this.__filtering = false;
        this.emit(this.events.filter);
      }
    }]);

    return _class;
  })(_BaseStore3.default);
};