"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

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

    // set what parameter from the record is used as id
    _this.idMap = "id";

    //todo: implement dirty records
    _this.optimisticUpdate = false;

    // overridable base variables
    _this.events = _defaultEvents;

    // data ttl in local db
    _this.__ttl = 10000; //ms
    _this.__tableRecord = _immutable2.default.Record({ __counter: 0, __collection: _immutable2.default.Map(), __dict: _immutable2.default.Map(), __expire: Date.now() });

    // init db
    _this.__key = _this.__generateKey({}, {});
    _this.__db = _immutable2.default.Map().set(_this.__key, new _this.__tableRecord());
    _this.__useCache = true;

    // list of parameters to reset when init is called;
    _this.__toReset = [];

    // internal
    _this.__dispatcher = __dispatcher;
    _this.__dispatchToken = _this.__dispatcher.register(_this.payloadHandler.bind(_this));

    // backend sync class
    _this.__sync = sync;
    return _this;
  }

  /*********************************/
  /**  get set overrides scripts  **/
  /*********************************/
  // override collection

  _createClass(BaseStore, [{
    key: "__generateKey",

    /****************/
    /**  DB Utils  **/
    /****************/

    value: function __generateKey(context, params) {
      return _immutable2.default.fromJS(Object.assign({ ns: this.constants.namespace }, context, params));
    }
  }, {
    key: "__getCurrentTable",
    value: function __getCurrentTable() {
      return this.__db.get(this.__key);
    }
  }, {
    key: "__updateTable",
    value: function __updateTable(table) {
      this.__db = this.__db.set(this.__key, table);
      return Promise.resolve(table);
    }
  }, {
    key: "__loadData",
    value: function __loadData(data) {
      this.__updateTable(this.__parseResult(data, this.__getCurrentTable())).then(function (table) {
        //console.log("table updated", table);
      });
      return this.getAll();
    }

    /****************/
    /**   Parsing  **/
    /****************/

  }, {
    key: "__parseResult",
    value: function __parseResult(data, tableRecord) {
      var _this2 = this;

      if (!tableRecord) {
        tableRecord = new this.__tableRecord();
      }

      var __dict = tableRecord.get("__dict");
      var __collection = tableRecord.get("__collection");
      var __counter = tableRecord.get("__counter");

      data.forEach(function (elt) {
        var id = elt.id.toString();
        if (!__dict.has(id)) {

          var r = _this2.__parseModel(elt);
          var __cid = "c" + __counter;

          r = r.set("__cid", __cid);
          __collection = __collection.set(__cid, r);
          __dict = __dict.set(r.id.toString(), __cid);
          ++__counter;
        } else {
          var __cid = __dict.get(id);
          var r = _this2.__parseModel(elt);
          r = r.set("__cid", __cid);
          if (!_immutable2.default.is(r, __collection.get(__cid))) {
            //console.log("got different data", r.toJS());
            __collection = __collection.set(__cid, r);
          }
        }
      });

      //update table
      tableRecord = tableRecord.withMutations(function (map) {
        map.set("__dict", __dict).set("__collection", __collection).set("__counter", __counter);
      });

      return tableRecord;
    }
  }, {
    key: "__parseModel",
    value: function __parseModel(data) {
      return this.record.fromJS(data);
    }

    /********************/
    /**  Init scripts  **/
    /********************/

  }, {
    key: "init",
    value: function init() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var context = _ref.context;
      var params = _ref.params;

      this.key = this.__generateKey(context, params);
      var __tr = this.__getCurrentTable();

      // We only fetch when :
      // sync exists
      // table does not exist
      // table expire date has expired and sync is defined
      if ((!__tr || __tr && __tr.__expire <= Date.now() - this.__ttl) && this.__sync) {
        return this.__sync.context(context).fetchAll(params).then((function (result) {
          return Promise.resolve(this.__parseResult(__tr, result));
        }).bind(this)).then(this.__updateTable(resultTable)).then(function () {
          return Promise.resolve(this.getAll());
        });
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

      this.key = this.__generateKey(context, params);
      var __tr = this.__getCurrentTable();

      if ((!__tr || __tr && __tr.__expire <= Date.now() - this.__ttl) && this.__sync) {
        return this.__sync.context(context).fetch(id, params).then((function (result) {
          return Promise.resolve(this.__parseResult(__tr, [result]));
        }).bind(this)).then(this.__updateTable(resultTable)).then((function () {
          return Promise.resolve(this.get(id));
        }).bind(this));
      } else {
        return Promise.resolve(this.get(id));
      }
    }

    //todo : check this

  }, {
    key: "refresh",
    value: function refresh() {
      var _ref3 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var record = _ref3.record;
      var context = _ref3.context;
      var params = _ref3.params;

      this.key = this.__generateKey(context, params);

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

    /********************/
    /**  Base methods  **/
    /********************/

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
  }, {
    key: "__add",
    value: function __add(r) {
      var _this3 = this;

      // if cid is not empty it means it wal already added, this should not throw an error, but maybe we should trigger an edit
      if (!r.get("__cid")) {
        var _ret = (function () {
          var table = _this3.__getCurrentTable();
          // set cid from internal collection counter
          r = r.set("__cid", "c" + table.__counter);

          // if sync is not set and id is not set, we forge a new id
          // when id is already set, we conserve it
          if (!_this3.__sync && !r.get("id")) {
            r = r.set("id", guid());
          }

          // update collection, dict and counter
          var counter = table.__counter + 1;
          table = table.withMutations(function (t) {
            t.setIn(["__collection", r.get("__cid")], r).setIn(["__dict", r.get("id").toString()], r.get("__cid")).set("__counter", counter);
          });

          _this3.__updateTable(table);
          return {
            v: r
          };
        })();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
      } else {
        console.warn("Record has been already added to the collection.");
      }
    }
  }, {
    key: "__edit",
    value: function __edit(r) {
      var table = this.__getCurrentTable();

      if (r.get("__cid") && table.__collection.has(r.get("__cid"))) {
        table = table.setIn(["__collection", r.get("__cid")], r);
        this.__updateTable(table);
        return r;
      } else {
        throw Error("Cannot edit record.");
      }
    }
  }, {
    key: "__remove",
    value: function __remove(r) {
      var table = this.__getCurrentTable();

      if (r.get("__cid") && table.__collection.has(r.get("__cid")) && table.__dict.has(r.get("id").toString())) {
        // Set map with __cid and record
        table = table.withMutations(function (t) {
          t.removeIn(["__collection", r.get("__cid")]).removeIn(["__dict", r.get("id").toString()]);
        });
        this.__updateTable(table);
        return r;
      } else {
        throw Error("Cannot remove record.");
      }
    }

    /********************/
    /** Getters **/
    /********************/

  }, {
    key: "getByCid",
    value: function getByCid(cid) {
      return this.__collection.get(cid);
    }
  }, {
    key: "get",
    value: function get(id) {
      if (id) {
        // force id to string
        id = id.toString();
        var cid = this.__dict.get(id) || -1;

        // should return undefined if id does not exist
        return this.getByCid(cid);
      }
      throw Error("missing id");
    }
  }, {
    key: "getAll",
    value: function getAll() {
      return this.collection;
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
  }, {
    key: "collection",
    get: function get() {
      return this.__collection;
    },
    set: function set(collection) {
      this.__collection = collection;
    }

    // override __collection

  }, {
    key: "__collection",
    get: function get() {
      return this.__db.getIn([this.__key, "__collection"]);
    },
    set: function set(collection) {
      this.__db = this.__db.setIn([this.__key, "__collection"], collection);
    }

    // override __collection

  }, {
    key: "__dict",
    get: function get() {
      return this.__db.get(this.__key).get("__dict");
    }
  }, {
    key: "key",
    get: function get() {
      return this.__key;
    },
    set: function set(key) {
      // this means we change table so we should reset some parameters
      if (key != this.__key) {
        this.emit("__reset");
      }
      this.__key = key;
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