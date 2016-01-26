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
  init: 'init',
  initOne: 'initOne',
  change: 'change',
  create: 'create',
  update: 'update',
  delete: 'delete',
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

      if (this.__sync) {
        return this.__sync.context(context).fetchAll(params).then((function (result) {
          return Promise.resolve(this.__loadData(result));
        }).bind(this));
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

      if (this.__sync) {
        return this.__sync.context(context).fetch(id, params).then((function (result) {
          return Promise.resolve(this.__loadData([result]));
        }).bind(this)).then((function () {
          return Promise.resolve(this.get(id));
        }).bind(this));
      } else {
        return Promise.resolve(this.get(id));
      }
    }
  }, {
    key: "refresh",
    value: function refresh() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref3.record;
      var context = _ref3.context;
      var params = _ref3.params;

      var id = record.get("id");
      if (this.__sync) {
        return this.__sync.context(context).fetch(id, params).then((function (result) {
          var newRecord = this.__parseModel(result);
          var oldRecord = this.get(id);
          // we check that record already exists
          if (oldRecord) {
            //copy old record cid to new record cid.
            this.__edit(newRecord.set("__cid", oldRecord.get("__cid")));
          } else {
            // if record not exists we add it to collection
            this.__add(newRecord);
          }
          return Promise.resolve(this.get(id));
        }).bind(this));
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
      // if cid is not empty it means it wal already added, this should not throw an error, but maybe we should trigger an edit
      if (!r.get("__cid")) {
        // set cid from internal collection counter
        this.__counter = this.__counter + 1;
        r = r.set("__cid", "c" + this.__counter);

        // if sync is not set and id is not set, we forge a new id
        // when id is already set, we conserve it
        if (!this.__sync && !r.get("id")) {
          r = r.set("id", guid());
        }

        // Set map with __cid and record
        this.__collection = this.__collection.set(r.get("__cid"), r);

        // add item to dict to be able to find it from id
        this.__addToDict(r);

        return r;
      } else {
        console.warn("Record has been already added to the collection.");
      }
    }
  }, {
    key: "__edit",
    value: function __edit(r) {
      if (r.get("__cid") && this.__collection.has(r.get("__cid"))) {
        this.__collection = this.__collection.set(r.get("__cid"), r);
      } else {
        throw Error("Cannot edit record.");
      }
    }
  }, {
    key: "__remove",
    value: function __remove(r) {
      if (r.get("__cid") && this.__collection.has(r.get("__cid")) && this.__dict.has(r.get("id").toString())) {
        this.__collection = this.__collection.remove(r.get("__cid"));
        this.__dict = this.__dict.remove(r.get("id").toString());
      } else {
        throw Error("Cannot remove record.");
      }
    }
  }, {
    key: "__addToDict",
    value: function __addToDict(r) {
      // check if id is set
      if (!r.get("id")) {
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
    key: "__checkRecord",
    value: function __checkRecord(_record) {
      if (!(_record instanceof _immutable2.default.Record)) {
        throw new Error("The record instance needs to be an instance of Immutable.Record");
      }

      if (!_record.has("__cid")) {
        throw new Error("The record instance needs to have a __cid key");
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
        var cid = this.__dict.get(id) || -1;

        console.log("cid check", cid, this.__dict.get(id));
        // should return undefind if id does not exist
        return this.__getByCid(cid);
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
    key: "__create",
    value: function __create() {
      var _ref4 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref4.record;
      var context = _ref4.context;

      this.__checkRecord(record);
      if (this.__sync) {
        return this.__sync.context(context).create(record).then((function (record) {
          // r is the updated version of record (with __cid set)
          var r = this.__add(record);
          return Promise.resolve(r);
        }).bind(this));
      } else {
        this.__add(record);
        return Promise.resolve(record);
      }
    }
  }, {
    key: "create",
    value: function create() {
      this.__create.apply(this, arguments).then((function (record) {
        this.emit(this.events.change);
        this.emit(this.events.create, record);
      }).bind(this)).catch((function (error) {
        this.emit(this.events.error, error);
      }).bind(this));
    }
  }, {
    key: "__update",
    value: function __update() {
      var _ref5 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref5.record;
      var context = _ref5.context;

      this.__checkRecord(record);

      var originalRecord = this.__collection.get(record.get("__cid"));

      // check if record exist
      if (!originalRecord) {
        throw new Error("Record does not exist in collection.");
      }
      // can update ?
      if (!record.get("id")) {
        throw new Error("Cannot update non persisted entity.");
      }
      //don't edit and sync if records are equals.
      if (_immutable2.default.is(record, originalRecord)) {
        return Promise.resolve(record);
      }

      if (this.__sync) {
        return this.__sync.context(context).update(record).then((function (record) {
          this.__edit(record);
          return Promise.resolve(record);
        }).bind(this));
      } else {
        this.__edit(record);
        return Promise.resolve(record);
      }
    }
  }, {
    key: "update",
    value: function update() {
      this.__update.apply(this, arguments).then((function (record) {
        this.emit(this.events.change);
        this.emit(this.events.update, record);
      }).bind(this)).catch((function (error) {
        this.emit(this.events.error, error);
      }).bind(this));
    }
  }, {
    key: "__delete",
    value: function __delete() {
      var _ref6 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref6.record;
      var context = _ref6.context;

      this.__checkRecord(record);

      // check if record exist in collection (we check __dict)
      if (!this.__dict.has(record.get("id").toString())) {
        throw new Error("Record does not exist in collection.");
      }

      // can update ?
      if (!record.get("id")) {
        throw new Error("Cannot update non persisted entity.");
      }

      if (this.__sync) {
        return this.__sync.context(context).delete(record).then((function (record) {
          this.__remove(record);
          return Promise.resolve(record);
        }).bind(this));
      } else {
        this.__remove(record);
        return Promise.resolve(record);
      }
    }
  }, {
    key: "delete",
    value: function _delete() {
      this.__delete.apply(this, arguments).then((function (record) {
        this.emit(this.events.change);
        this.emit(this.events.delete, record);
      }).bind(this)).catch((function (error) {
        this.emit(this.events.error, error);
      }).bind(this));
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
        throw new Error('no function found for ' + fn);
      }
    }
  }]);

  return BaseStore;
})(_events.EventEmitter);

BaseStore.compose = function (behaviors) {
  if (!Array.isArray(behaviors)) {
    throw new Error("behaviors must be an array");
  }
  return behaviors.reduce(function (a, b) {
    return b(a);
  }, BaseStore);
};

exports.default = BaseStore;