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
  change: 'change',
  success: 'success',
  filter: 'filter',
  sort: 'sort',
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

    //todo: implement dirty records
    _this.optimisticUpdate = false;

    // filter
    _this.filterStr = "";
    _this.filterKeys = [];

    // sort
    _this.sortKeys = ["id"];

    // overridable base variables
    _this.events = _defaultEvents;
    _this.sortFunction = _defaultSortFunction;
    _this.filterFunction = _defaultFilterFunction;

    // PRIVATE IMPORTANT !!!!!
    _this.__reverse = false;
    _this.__counter = 0;
    _this.__collection = _immutable2.default.Map();
    _this.__filteredCollection;
    _this.__filtering = false;
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
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var context = _ref.context;

      if (!this.__initialized) {
        if (this.__sync) {
          this.__sync.context(context).fetchAll(this.__loadData.bind(this));
          window.setTimeout((function () {
            this.__initialized = false;
          }).bind(this), 10000);
        } else {
          this.__initialized = true;
        }
      }
    }
  }, {
    key: "initOne",
    value: function initOne() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var context = _ref2.context;

      if (!this.__initialized) {
        if (this.__sync) {
          this.__sync.context(context).fetch(this.__loadOne.bind(this));
          window.setTimeout((function () {
            this.__initialized = false;
          }).bind(this), 10000);
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
    }
  }, {
    key: "__loadOne",
    value: function __loadOne(data) {
      this.__loadData([data]);
    }
  }, {
    key: "__loadData",
    value: function __loadData(data) {
      // on load data, dict and collection must be reset (or merged).
      this.__collection = _immutable2.default.Map();
      this.__dict = _immutable2.default.Map();

      this.__parseCollection(data);
      this.__initialized = true;
      this.emit(this.events.change);
    }

    /********************/
    /**  Base methods  **/
    /********************/

    /**
     * Add and index record to collection
     */

  }, {
    key: "__add",
    value: function __add(r) {
      // on check que l'élément accepte les __cid
      if (r.has("__cid")) {
        // cid must be empty / null
        if (!r.get("__cid")) {
          // when there is no sync, there is no id so we forge one
          // ! we do not override existing ids
          if (!this.__sync && !r.has("id")) {
            r = r.set("id", guid());
          }

          // set cid from internal collection counter
          this.__counter = this.__counter + 1;
          r = r.set("__cid", "c" + this.__counter);

          // Set map with __cid and record
          this.__collection = this.__collection.set(r.get("__cid"), r);

          // add item to dict to be able to find it from id
          this.__addToDict(r);

          /*
          // if the object already exists in local collection
          if(this.__dict.has(r.get("id").toString())) {
            // what should we do ?
            console.warn("Record already exists in collection.");
             // we test if fetched object is different
            let __cid = this.__dict.get(r.get("id").toString());
            r = r.set("__cid", __cid);
            if(!Immutable.is(this.__collection.get(__cid), r)) {
              // if records are different we update the collection
              this.__collection = this.__collection.set(__cid, r);
            }
           } else {
            // set cid from internal collection counter
            this.__counter = this.__counter+1;
            r=r.set("__cid", "c"+this.__counter);
             // Set map with __cid and record
            this.__collection = this.__collection.set(r.get("__cid"), r);
             // add item to dict to be able to find it from id
            this.__addToDict(r);
          }
          */
        }
      } else {
          throw new Error("Model invalid, does not support __cid");
        }
    }
  }, {
    key: "__addWithEmit",
    value: function __addWithEmit(r) {
      this.__add(r);
      this.emit(this.events.success);
      this.emit(this.events.change);
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
        if (this.__dict.get(id) == r.get("__cid")) {
          console.warn("Record has been already indexed: ", id);
        } else {
          throw new Error("Record with id :" + id + "does not match with index");
        }
      } else {
        this.__dict = this.__dict.set(id, r.get("__cid"));
      }
    }
  }, {
    key: "__getByCid",
    value: function __getByCid(cid) {
      return this.__collection.get(cid);
    }
  }, {
    key: "__assertRecord",
    value: function __assertRecord(_record) {
      if (!(_record instanceof _immutable2.default.Record)) {
        throw new Error("The record instance needs to be an instance of Immutable.Record");
      }
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
          return Promise.resolve(this.__getByCid(cid));
        } else if (!this.__initialized) {
          return this.__sync.fetch(id);
        }
      }
      return Promise.reject(new Error("missing id"));
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
      if (this.__filtering) {
        var sortedCollection = this.__collection.filter(this.filterFunction.bind(this)).sort(this.sortFunction.bind(this));
        return this.__reverse ? sortedCollection.reverse() : sortedCollection;
      } else {
        var sortedCollection = this.__collection.sort(this.sortFunction.bind(this));
        return this.__reverse ? sortedCollection.reverse() : sortedCollection;
      }
    }

    /**********************/
    /**  actions handler **/
    /**********************/

    // todo : when dealing with record, we should check that it is an instance of Record

  }, {
    key: "create",
    value: function create() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref3.record;
      var context = _ref3.context;

      this.__assertRecord(record);

      if (this.__sync) {
        this.__sync.context(context).create(record, this.__addWithEmit.bind(this));
      } else {
        this.__addWithEmit(record);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref4.record;
      var context = _ref4.context;

      this.__assertRecord(record);

      // can update ?
      if (!record.get("id")) {
        throw new Error("Cannot update non synced entity.");
      }

      // should update and sync ?
      var originalRecord = this.__collection.get(record.get("__cid"));
      if (_immutable2.default.is(record, originalRecord)) {
        this.__edit(record);
        return;
      }

      if (this.__sync) {
        this.__sync.context(context).update(record, this.__edit.bind(this));
      } else {
        this.__edit(record);
      }
    }
  }, {
    key: "delete",
    value: function _delete() {
      var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref5.record;
      var context = _ref5.context;

      this.__assertRecord(record);

      if (record.get("__cid") && record.get("id")) {
        if (this.__sync) {
          this.__sync.context(context).delete(record, this.__remove.bind(this));
        } else {
          this.__remove(record);
        }
      } else {
        throw new Error("Cannot remove this record from collection, no __cid nor id");
      }
    }

    /*******************************/
    /** filter collection section **/
    /*******************************/

  }, {
    key: "filter",
    value: function filter(_ref6) {
      var criterion = _ref6.criterion;
      var keys = _ref6.keys;

      this.filterStr = criterion.toString();
      this.filterKeys = keys;

      if (this.filterStr.length > this.triggerSearchAt) {
        this.emit(this.events.filter);
        this.__filtering = true;
      } else if (this.__filtering === true) {
        this.resetFilter();
      }
    }
  }, {
    key: "resetFilter",
    value: function resetFilter() {
      this.criterion = undefined;
      this.__filtering = false;
      this.emit(this.events.filter);
    }

    /*****************************/
    /** Sort collection section **/
    /*****************************/

  }, {
    key: "sort",
    value: function sort(_ref7) {
      var keys = _ref7.keys;

      this.resetSort();
      this.sortKeys = keys || ["id"];
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