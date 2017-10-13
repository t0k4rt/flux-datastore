"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FilterableStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _BaseStore = require("../BaseStore");

var _BaseStore2 = _interopRequireDefault(_BaseStore);

var _lodash = require("lodash.debounce");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultFilterSingleFunction = function _defaultFilterSingleFunction(value, key) {
  var result = false;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = this.filterKeys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var field = _step.value;


      var valueLowered = null;
      var valueField = value;

      // If there is field nested
      if (field.indexOf('.') != -1) {
        var fields = field.split('.');

        for (var i = 0; i < fields.length; i++) {
          valueField = valueField.get(fields[i]);
        }
      } else {
        valueField = valueField.get(field);
      }

      // Lower string or object
      if (valueField) {
        if (typeof valueField == 'string') {
          valueLowered = valueField.toLowerCase();
        } else if (typeof valueField == 'number') {
          valueLowered = String(valueField);
        } else if ((typeof valueField === "undefined" ? "undefined" : _typeof(valueField)) == 'object') {
          valueLowered = valueField.map(function (value) {
            return value.toLowerCase();
          });
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.filterCriteria[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var criterion = _step2.value;

          if (value.get(criterion) && value.get(criterion).indexOf(this.filterCriteria.get(criterion)) != -1) {
            result = true;
            break;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (valueLowered && valueLowered.indexOf(this.filterStr.toLowerCase()) != -1) {
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

var _defaultFilterMultipleFunction = function _defaultFilterMultipleFunction(value, key) {
  var result = true;

  // By default the result will be true, here we check all the values passed in the research form
  // And if ONE value is not found we return false. Its a research by addition

  // 1. Loop on each criterion available for the search
  for (var criterion in this.filterCriteria) {
    var valueLowered = null;

    // 2. We lower case all the values
    if (value.get(criterion)) {
      if (typeof value.get(criterion) == 'string') {
        valueLowered = value.get(criterion).toLowerCase();
      } else if (typeof value.get(criterion) == 'number') {
        valueLowered = String(value.get(criterion));
      } else if (_typeof(value.get(criterion)) == 'object') {
        valueLowered = value.get(criterion).map(function (value) {
          return value.toLowerCase();
        });
      }
    }

    // 3. Check if the values set in the research is NOT in the list
    if (valueLowered) {
      // 3a. If the criterion value is an Array (Ex. Tags) we run a loop in order to compare each tags
      if (Array.isArray(this.filterCriteria[criterion])) {
        if (this.filterCriteria[criterion].length > 0) {
          for (var i = 0; i < this.filterCriteria[criterion].length; i++) {
            if (valueLowered.indexOf(this.filterCriteria[criterion][i].toLowerCase()) == -1) {
              result = false;
            }
          }
        }
      }
      // 3b. Else we just compare the criterion value with the list
      else {
          // If the parameters ask for an strict equal comparaison
          if (this.filterCriteriaEqualSearch[criterion] == true) {
            if (valueLowered == this.filterCriteria[criterion].toLowerCase()) {
              result = false;
            }
          } else {
            if (valueLowered.indexOf(this.filterCriteria[criterion].toLowerCase()) == -1) {
              result = false;
            }
          }
        }
    } else {
      // If we research in an empty value = NO result
      if (this.filterCriteria[criterion].length > 0) {
        result = false;
      }
    }
  }

  return result;
};

var FilterableStore = exports.FilterableStore = function FilterableStore(ComposedStore) {
  return function (_ComposedStore) {
    _inherits(_class, _ComposedStore);

    function _class(record, constants, __dispatcher, sync) {
      _classCallCheck(this, _class);

      // is filterable flag
      var _this = _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, record, constants, __dispatcher, sync));

      _this.isFilterable = true;

      _this.events = Object.assign(_this.events, { filter: 'filter' });
      _this.triggerFilterAt = 3;
      _this.filterStr = "";
      _this.filterKeys = [];
      _this.filterCriteria = [];
      _this.filterSingleFunction = _defaultFilterSingleFunction;
      _this.filterMultipleFunction = _defaultFilterMultipleFunction;
      _this.filterFunction = _this.filterSingleFunction;
      _this.__filtering = false;
      _this.__debouncedelay = 300;

      // permits to define strict equal comparaison or contains comparaison
      _this.filterCriteriaEqualSearch = [];

      // debounced emitfilter, it's easier than debouncing filter function
      _this.__emitFilter = (0, _lodash2.default)(function () {
        if (this.filterStr.length > 0 || Object.keys(this.filterCriteria).length > 0) {
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
        this.filterCriteria = [];
        this.filterCriteriaEqualSearch = [];
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
        var criterion = _ref.criterion,
            keys = _ref.keys;

        this.filterStr = criterion.toString();
        this.filterKeys = keys;
        this.filterFunction = this.filterSingleFunction;
        if (this.filterStr.length === 0) {
          this.resetFilter();
        } else {
          this.__filtering = true;
          this.__emitFilter();
        }
      }
    }, {
      key: "filterMultiple",
      value: function filterMultiple(_ref2) {
        var criteria = _ref2.criteria,
            eqSearch = _ref2.eqSearch;

        this.filterCriteria = criteria;
        this.filterCriteriaEqualSearch = eqSearch;
        this.filterFunction = this.filterMultipleFunction;
        if (this.filterCriteria.length === 0) {
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
  }(ComposedStore);
};