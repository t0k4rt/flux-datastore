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
  error: 'error'
};

// GUID generator when there is no sync
var guid = function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return s4() + s4();
};

var BaseStore = (function (_EventEmitter) {
  _inherits(BaseStore, _EventEmitter);

  function BaseStore(record, constants, __dispatcher, sync) {
    _classCallCheck(this, BaseStore);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(BaseStore).call(this));

    _this.constants = constants;
    _this.record = record;
    _this.idMap = "id";

    //todo: implement dirty records
    _this.optimisticUpdate = false;

    // overridable base variables
    _this.events = _defaultEvents;

    // PRIVATE IMPORTANT !!!!!
    _this.__counter = 0;
    _this.__collection = _immutable2.default.Map();
    _this.__dispatcher = __dispatcher;
    _this.__dispatchToken = _this.__dispatcher.register(_this.payloadHandler.bind(_this));
    _this.__dict = _immutable2.default.Map();
    _this.__sync = sync;
    _this.__initialized = false;
    return _this;
  }

  /********************/
  /**  Init scripts  **/
  /********************/

  _createClass(BaseStore, [{
    key: "init",
    value: function init() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var context = _ref.context;
      var params = _ref.params;

      if (!this.__initialized) {
        if (this.__sync) {
          window.setTimeout((function () {
            this.__initialized = false;
          }).bind(this), 1500);
          return this.__sync.context(context).fetchAll(params).then((function (result) {
            this.__initialized = true;
            return Promise.resolve(this.__loadData(result));
          }).bind(this));
        } else {
          this.__initialized = true;
        }
      } else {
        return Promise.resolve(this.getAll());
      }
    }
  }, {
    key: "initOne",
    value: function initOne() {
      var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var id = _ref2.id;
      var context = _ref2.context;
      var params = _ref2.params;

      if (!this.__initialized) {
        if (this.__sync) {
          return this.__sync.context(context).fetch(id, params).then((function (result) {
            return Promise.resolve(this.__loadData([result]));
          }).bind(this)).then((function () {
            return Promise.resolve(this.get(id));
          }).bind(this));
        } else {
          this.__initialized = true;
        }
      } else {
        return Promise.resolve(this.get(id));
      }
    }
  }, {
    key: "__loadData",
    value: function __loadData(data) {
      this.__collection = this.__collection.clear();
      this.__dict = this.__dict.clear();
      this.__parseCollection(data);

      return this.getAll();
    }
  }, {
    key: "__loadDataBis",
    value: function __loadDataBis(data) {
      this.__collection = _immutable2.default.Map();
      this.__dict = _immutable2.default.Map();
      this.__parseCollection(data);

      return this.getAll();
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
    key: "__parseModel",
    value: function __parseModel(data) {
      return this.record.fromJS(data);
    }
  }, {
    key: "__computeDiff",
    value: function __computeDiff(toCompare, criterion) {
      var __ids = this.__dict.flip().toList().toArray();
      var __diff = [];
      toCompare.forEach(function (value) {
        if (__ids.indexOf(value[criterion].toString()) === -1) {
          __diff.push(value);
        }
      });
      return __diff;
    }
  }, {
    key: "__loadDiffData",
    value: function __loadDiffData(data) {
      var diff = this.__computeDiff(data, this.idMap);
      this.__parseCollection(diff);
      return this.getAll();
    }
  }, {
    key: "__mergeData",
    value: function __mergeData(data) {}
    //todo : do data merge here but it is complicated

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
          if (!this.__sync && !r.get("id")) {
            r = r.set("id", guid());
          }

          // Set map with __cid and record
          this.__collection = this.__collection.set(r.get("__cid"), r);

          // add item to dict to be able to find it from id
          this.__addToDict(r);
          //todo : migrate these events
          //this.emit(this.events.success);
          //this.emit(this.events.change);
        }
      } else {
          throw new Error("Model invalid, does not support __cid");
        }
    }
  }, {
    key: "__edit",
    value: function __edit(r) {
      this.__collection = this.__collection.set(r.get("__cid"), r);
    }
  }, {
    key: "__remove",
    value: function __remove(r) {
      var cid = r.get("__cid");
      // force id to string
      var id = r.get("id").toString();
      this.__collection = this.__collection.remove(cid);
      this.__dict = this.__dict.remove(id);
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
          return this.__getByCid(cid);
        } else {
          return undefined;
        }
      }
      throw Error("missing id");
    }
  }, {
    key: "getAll",
    value: function getAll() {
      return this.__collection;
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
        return this.__sync.context(context).create(record).then((function (record) {
          this.__add(record);
          this.emit(this.events.change);
          this.emit(this.events.success);
          return Promise.resolve(record);
        }).bind(this)).catch((function (error) {
          this.emit(this.events.error, error);
        }).bind(this));
      } else {
        this.__add(record);
        return Promise.resolve(record);
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
        return Promise.resolve(record);
      }

      if (this.__sync) {
        return this.__sync.context(context).update(record).then((function (record) {
          this.__edit(record);
          this.emit(this.events.change);
          this.emit(this.events.success);
          return Promise.resolve(record);
        }).bind(this)).catch((function (error) {
          this.emit(this.events.error, error);
        }).bind(this));
      } else {
        this.__edit(record);
        return Promise.resolve(record);
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
          return this.__sync.context(context).delete(record).then((function (record) {
            this.__remove(record);
            this.emit(this.events.change);
            this.emit(this.events.success);
            return Promise.resolve(record);
          }).bind(this)).catch((function (error) {
            this.emit(this.events.error, error);
          }).bind(this));
        } else {
          this.__remove(record);
          return Promise.resolve(record);
        }
      } else {
        throw new Error("Cannot remove this record from collection, no __cid or id");
      }
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

  return BaseStore;
})(_events.EventEmitter);

exports.default = BaseStore;