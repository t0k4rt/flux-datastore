"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultEvents = {
  load: 'load',
  change: 'change',
  success: 'success',
  filter: 'filter',
  error: 'error'
};

var _defaultSortFunction = function _defaultSortFunction(a, b) {
  var valueA = undefined,
      valueB = undefined;
  if (this.sortKeys.length > 0) {
    valueA = a.get(this.sortKeys[0]);
    valueB = b.get(this.sortKeys[0]);
  } else {
    valueA = a.get("__cid");
    valueB = b.get("__cid");
  }

  if (valueA === valueB) return 0;else return valueA > valueB ? 1 : -1;
};

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

var guid = function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4();
};

var SimpleStore = (function (_EventEmitter) {
  _inherits(SimpleStore, _EventEmitter);

  function SimpleStore(record, constants, __dispatcher, sync) {
    _classCallCheck(this, SimpleStore);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SimpleStore).call(this));

    _this.constants = constants;
    _this.record = record;
    _this.triggerSearchAt = 3;
    _this.idMap = "id";
    //todo
    _this.optimisticUpdate = false;

    // filter
    _this.filterStr = "";
    _this.filterKeys = [];

    // sort
    _this.sortKeys = [];

    // overridable base variables
    _this.events = _defaultEvents;
    _this.sortFunction = _defaultSortFunction;
    _this.filterFunction = _defaultFilterFunction;

    // PRIVATE IMPORTANT !!!!!
    _this.__reverse = false;
    _this.__counter = 0;
    _this.__collection = _immutable2.default.Map();
    _this.__filteredCollection;
    _this.__dispatcher = __dispatcher;
    _this.__dispatcher.register(_this.payloadHandler.bind(_this));
    _this.__dict = _immutable2.default.Map();
    _this.__sync = sync;
    _this.__initialized = false;
    return _this;
  }

  /********************/
  /**  Init scripts  **/
  /********************/

  _createClass(SimpleStore, [{
    key: "init",
    value: function init() {
      if (!this.__loaded) {
        if (this.__sync) {
          this.__sync.fetchAll(this.__loadData.bind(this));
        } else {
          this.__initialized = true;
        }
      }
    }
  }, {
    key: "__parseModel",
    value: function __parseModel(data) {
      return this.record.fromJS(data);
    }
  }, {
    key: "__parseCollection",
    value: function __parseCollection(data) {
      var _this2 = this;

      data.forEach(function (elt, index) {
        var record = _this2.__parseModel(elt);
        _this2.__add(record);
      });
      this.emit(this.events.change);
    }
  }, {
    key: "__loadData",
    value: function __loadData(data) {
      this.__parseCollection(data);
      this.__initialized = true;
      this.emit(this.events.change);
    }

    /********************/
    /**  Base methods  **/
    /********************/

  }, {
    key: "__add",
    value: function __add(r) {
      // on check que l'élément accepte les __cid
      if (r.has("__cid")) {
        // cid must be empty / null
        if (!r.get("__cid")) {
          // set cid from internal collection counter
          this.__counter = this.__counter + 1;
          r = r.set("__cid", "c" + this.__counter);

          // when there is no sync, there is no id so we forge one
          if (!this.__sync) {
            r = r.set("id", guid());
          }

          // Set map with __cid and record
          this.__collection = this.__collection.set(r.get("__cid"), r);

          // add item to dict to be able to find it from id
          this.__addToDict(r);

          this.emit(this.events.success);
          this.emit(this.events.change);
        }
      } else {
        throw new Error("Model invalid, does not support __cid");
      }
    }
  }, {
    key: "__edit",
    value: function __edit(r) {
      this.__collection = this.__collection.set(r.get("__cid"), r);
      this.emit(this.events.success);
      this.emit(this.events.change);
    }
  }, {
    key: "__remove",
    value: function __remove(r) {
      var cid = r.get("__cid");
      // force id to string
      var id = r.get("id").toString();
      this.__collection = this.__collection.remove(cid);
      this.__dict = this.__dict.remove(id);
      this.emit(this.events.success);
      this.emit(this.events.change);
    }
  }, {
    key: "__addToDict",
    value: function __addToDict(r) {
      // check if id is set
      if (!r.has("id") || !r.get("id")) {
        throw new Error("Cannot index record without id.");
      }
      // force id to string
      var id = r.get("id").toString();
      // check if record has not already been indexed
      if (this.__dict.has(id)) {
        console.warn("Record has been already indexed.", id);
      } else {
        this.__dict = this.__dict.set(id, r.get("__cid"));
      }
    }
  }, {
    key: "__getByCid",
    value: function __getByCid(cid) {
      return this.__collection.get(cid);
    }

    /********************/
    /** Public getters **/
    /********************/

  }, {
    key: "get",
    value: function get(id) {
      if (id) {
        // force id to string
        id = id.toString();
        var cid = this.__dict.get(id);
        if (cid) {
          return this.__getByCid(cid);
        } else {
          return undefined;
        }
      }
    }
  }, {
    key: "getAll",
    value: function getAll() {
      // always sort collection by id map
      var sortedCollection = this.__collection.sort(this.sortFunction.bind(this));
      return this.__reverse ? sortedCollection.reverse() : sortedCollection;
    }
  }, {
    key: "getFiltered",
    value: function getFiltered() {
      if (this.__filteredCollection instanceof _immutable2.default.Map) {
        var sortedCollection = this.__filteredCollection.sort(this.sortFunction.bind(this));
        return this.__reverse ? sortedCollection.reverse() : sortedCollection;
      } else {
        return undefined;
      }
    }

    /**********************/
    /**  actions handler **/
    /**********************/

    // todo : when dealing with record, we should check that it is an instance of Record

  }, {
    key: "create",
    value: function create(_ref) {
      var record = _ref.record;

      if (this.__sync) {
        this.__sync.create(record, this.__add.bind(this));
      } else {
        this.__add(record);
      }
    }
  }, {
    key: "update",
    value: function update(_ref2) {
      var record = _ref2.record;

      // can update ?
      if (!record.get("id")) {
        throw new Error("Cannot update non synced entity.");
      }

      // should update ?
      var originalRecord = this.__collection.get(record.get("__cid"));
      if (_immutable2.default.is(record, originalRecord)) {
        return;
      }

      if (this.__sync) {
        this.__sync.update(record, this.__edit.bind(this));
      } else {
        this.__edit(record);
      }
    }
  }, {
    key: "delete",
    value: function _delete(_ref3) {
      var record = _ref3.record;

      if (record.get("__cid") && record.get("id")) {
        if (this.__sync) {
          this.__sync.update(record, this.__remove.bind(this));
        } else {
          this.__remove(record);
        }
      } else {
        throw new Error("Cannot remove this record from collection, no __cid or id");
      }
    }

    /*******************************/
    /** filter collection section **/
    /*******************************/

  }, {
    key: "filter",
    value: function filter(_ref4) {
      var criterion = _ref4.criterion;
      var keys = _ref4.keys;

      this.filterStr = criterion.toString();
      this.filterKeys = keys;

      var filtering = false;

      if (this.filterStr.length > this.triggerSearchAt) {
        this.__filteredCollection = this.__collection.filter(this.filterFunction.bind(this));
        this.emit(this.events.filter);
        filtering = true;
      } else if (filtering && this.filterStr.length + 1 > this.triggerSearchAt) {
        this.__filteredCollection = this.collection;
        this.emit(this.events.filter);
        filtering = false;
      }
    }
  }, {
    key: "resetFilter",
    value: function resetFilter() {
      this.criterion = undefined;
      this.__filteredCollection = undefined;
    }

    /*****************************/
    /** Sort collection section **/
    /*****************************/

  }, {
    key: "sort",
    value: function sort(_ref5) {
      var keys = _ref5.keys;

      this.resetSort();
      this.sortKeys = keys || [];
      this.emit(this.events.sort);
    }
  }, {
    key: "resetSort",
    value: function resetSort() {
      this.sortKeys = [];
      this.__reverse = false;
    }
  }, {
    key: "reverse",
    value: function reverse() {
      this.__reverse = !this.__reverse;
    }

    /**********************/
    /** listener section **/
    /**********************/

  }, {
    key: "listenTo",
    value: function listenTo(eventName, callback) {
      this.on(eventName, callback);
    }
  }, {
    key: "stopListeningTo",
    value: function stopListeningTo(eventName, callback) {
      this.removeListener(eventName, callback);
    }
  }, {
    key: "listenToChanges",
    value: function listenToChanges(callback) {
      this.listenTo(this.events.change, callback);
    }
  }, {
    key: "stopListeningToChanges",
    value: function stopListeningToChanges(callback) {
      this.stopListeningTo(this.events.change, callback);
    }

    /**************************/
    /** action proxy handler **/
    /**************************/

  }, {
    key: "payloadHandler",
    value: function payloadHandler(payload) {
      if (payload.namespace != this.constants.namespace) {
        return;
      }
      // get fn name from payload type
      var fn = this.constants.__dict.get(payload.type);
      // check if fn exists for current class
      if (fn && Reflect.has(this, fn)) {
        fn = Reflect.get(this, fn);
        Reflect.apply(fn, this, [payload]);
      } else {
        console.error('no function found to handle ' + fn);
      }
    }
  }]);

  return SimpleStore;
})(_events.EventEmitter);

exports.default = SimpleStore;