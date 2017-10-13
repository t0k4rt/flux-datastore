"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

var BaseStore = function (_EventEmitter) {
  _inherits(BaseStore, _EventEmitter);

  function BaseStore(record, constants, __dispatcher, sync) {
    _classCallCheck(this, BaseStore);

    var _this = _possibleConstructorReturn(this, (BaseStore.__proto__ || Object.getPrototypeOf(BaseStore)).call(this));

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
    _this.__tableRecord = _immutable2.default.Record({ __counter: 0, __collection: _immutable2.default.Map(), __dict: _immutable2.default.Map(), __expire: null });

    // init db
    _this.__key = _this.__generateKey({}, {});
    _this.__db = _immutable2.default.Map().set(_this.__key, new _this.__tableRecord());
    _this.__useCache = true;

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
      var merge = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      this.__updateTable(this.__parseResult(data, this.__getCurrentTable(), merge)).then(function (table) {
        //console.log("table updated", table);
      });
      return this.getAll();
    }

    /****************/
    /**   Parsing  **/
    /****************/

  }, {
    key: "__parseResult",
    value: function __parseResult(data, table) {
      var _this2 = this;

      var merge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var update_expire = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;


      if (!table) {
        table = new this.__tableRecord();
      }

      var __dict = table.get("__dict");
      var __collection = table.get("__collection");
      var __counter = table.get("__counter");

      // seems to be the most efficient way to parse, taking collection size into account
      var __col = void 0,
          __di = void 0;
      var __check_same_record = false;

      // when we fetch less data than current collection
      // it's easier to parse again and recreate a new collection from scratch
      if (data.length < __collection.count() && !merge) {
        var _ref = [_immutable2.default.Map(), _immutable2.default.Map()];
        __col = _ref[0];
        __di = _ref[1];
      }
      // but when there is more data fetched, it's better to update and merge the current collection
      else {
          __di = __dict;
          __col = __collection;

          __check_same_record = true;
        }

      // these are temporary arrays where we will store records and data to insert
      var _4col = [];
      var _4dict = [];

      data.forEach(function (elt) {
        var id = elt.id.toString();

        // case 1: the record is not in dictionnary so it's a new record we should insert it in collection
        if (!__dict.has(id)) {
          var __cid = "c" + __counter;
          elt.__cid = __cid;
          var r = _this2.__parseModel(elt);
          _4col.push(r);
          _4dict.push(r);
          ++__counter;
        }
        //case 2: the record is already indexed in dict
        else {
            var _cid = __dict.get(id);

            // we parse the fetched record and make it look like our local record
            // this allows us to compare both local and fetched records
            var _r = _this2.__parseModel(elt);
            _r = _r.set("__cid", _cid);

            // since __col is equal to __collection we can check for record equality
            // (we'll be able to find record in _col)
            if (__check_same_record) {
              // we update item in __coll only if fetched and local are different
              if (!_immutable2.default.is(_r, __col.get(_cid))) {
                _4col.push(_r);
              }
            } else {
              // since __col and __di are empty maps
              // we copy record from __collection to new empty __col
              // and we re create __dict into __di
              _4col.push(_r);
              _4dict.push(_r);
            }
          }
      });

      __col = __col.withMutations(function (c) {
        _4col.forEach(function (r) {
          c.set(r.__cid, r);
        });
      });

      __di = __di.withMutations(function (d) {
        _4dict.forEach(function (r) {
          d.set(r.id.toString(), r.__cid);
        });
      });

      // we update __dict and __collection from temporary __di and __col


      // set expire date
      __dict = __di;
      __collection = __col;
      var expire = table.get("__expire");
      if (update_expire) {
        expire = Date.now();
      }
      //update table
      table = table.withMutations(function (map) {
        map.set("__dict", __dict).set("__collection", __collection).set("__counter", __counter).set("__expire", expire);
      });

      return table;
    }
  }, {
    key: "__parseResultBis",
    value: function __parseResultBis(data, table) {
      var _this3 = this;

      var merge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var update_expire = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      if (!table) {
        table = new this.__tableRecord();
      }

      var __dict = table.get("__dict");
      var __collection = table.get("__collection");
      var __counter = table.get("__counter");

      // seems to be the most efficient way to parse, taking collection size into account
      var __col = void 0,
          __di = void 0;
      var __check_same_record = false;

      // when we fetch less data than current collection
      // it's easier to parse again and recreate a new collection from scratch
      if (data.length < __collection.count() && !merge) {
        var _ref2 = [_immutable2.default.Map(), _immutable2.default.Map()];
        __col = _ref2[0];
        __di = _ref2[1];
      }
      // but when there is more data fetched, it's better to update and merge the current collection
      else {
          __di = __dict;
          __col = __collection;

          __check_same_record = true;
        }

      data.forEach(function (elt) {
        var id = elt.id.toString();

        // case 1: the record is not in dictionnary so it's a new record we should insert it in collection
        if (!__dict.has(id)) {

          var r = _this3.__parseModel(elt);
          var __cid = "c" + __counter;

          r = r.set("__cid", __cid);
          __col = __col.set(__cid, r);
          __di = __di.set(r.id.toString(), __cid);
          ++__counter;
        }
        //case 2: the record is already indexed in dict
        else {
            var _cid2 = __dict.get(id);

            // we parse the fetched record and make it look like our local record
            // this allows us to compare both local and fetched records
            var _r2 = _this3.__parseModel(elt);
            _r2 = _r2.set("__cid", _cid2);

            // since __col is equal to __collection we can check for record equality
            // (we'll be able to find record in _col)
            if (__check_same_record) {
              // we update item in __coll only if fetched and local are different
              if (!_immutable2.default.is(_r2, __col.get(_cid2))) {
                __col = __col.set(_cid2, _r2);
              }
            }
            // since __col and __di are empty maps
            // we copy record from __collection to new empty __col
            // and we re create __dict into __di
            else {
                __col = __col.set(_cid2, _r2);
                __di = __di.set(_r2.id.toString(), _cid2);
              }
          }
      });

      // we update __dict and __collection from temporary __di and __col


      // set expire date
      __dict = __di;
      __collection = __col;
      var expire = table.get("__expire");
      if (update_expire) {
        expire = Date.now();
      }
      //update table
      table = table.withMutations(function (map) {
        map.set("__dict", __dict).set("__collection", __collection).set("__counter", __counter).set("__expire", expire);
      });

      return table;
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
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          context = _ref3.context,
          params = _ref3.params;

      this.key = this.__generateKey(context, params);
      var table = this.__getCurrentTable();

      // We only fetch when :
      // sync exists
      // table does not exist
      // table expire date has expired and sync is defined
      if ((!table || table && table.__expire <= Date.now() - this.__ttl) && this.__sync) {
        //if(this.__sync) {
        return this.__sync.context(context).fetchAll(params).then(function (result) {
          return Promise.resolve(this.__parseResult(result, table));
        }.bind(this)).then(this.__updateTable.bind(this)).then(function () {
          //console.log("count", this.getAll().count());
          return Promise.resolve(this.getAll());
        }.bind(this));
      } else {
        return Promise.resolve(this.getAll());
      }
    }
  }, {
    key: "initOne",
    value: function initOne() {
      var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          id = _ref4.id,
          context = _ref4.context,
          params = _ref4.params;

      this.key = this.__generateKey(context, params);
      var table = this.__getCurrentTable();

      if ((!table || table && table.__expire <= Date.now() - this.__ttl) && this.__sync) {
        return this.__sync.context(context).fetch(id, params).then(function (result) {
          return Promise.resolve(this.__parseResult([result], table, true, false));
        }.bind(this)).then(this.__updateTable.bind(this)).then(function () {
          return Promise.resolve(this.get(id));
        }.bind(this));
      } else {
        return Promise.resolve(this.get(id));
      }
    }

    //todo : check this

  }, {
    key: "refresh",
    value: function refresh() {
      var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          record = _ref5.record,
          context = _ref5.context,
          params = _ref5.params;

      this.key = this.__generateKey(context, params);
      var table = this.__getCurrentTable();

      if (this.__sync) {
        return this.__sync.context(context).fetch(id, params).then(function (result) {
          return Promise.resolve(this.__parseResult([result], table));
        }.bind(this)).then(this.__updateTable.bind(this)).then(function () {
          return Promise.resolve(this.get(id));
        }.bind(this));
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
      // if cid is not empty it means it wal already added, this should not throw an error, but maybe we should trigger an edit
      if (!r.get("__cid")) {
        var table = this.__getCurrentTable();
        // set cid from internal collection counter
        r = r.set("__cid", "c" + table.__counter);

        // if sync is not set and id is not set, we forge a new id
        // when id is already set, we conserve it
        if (!this.__sync && !r.get("id")) {
          r = r.set("id", guid());
        }

        // update collection, dict and counter
        var counter = table.__counter + 1;
        table = table.withMutations(function (t) {
          t.setIn(["__collection", r.get("__cid")], r).setIn(["__dict", r.get("id").toString()], r.get("__cid")).set("__counter", counter);
        });

        this.__updateTable(table);
        return r;
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
      var _ref6 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          record = _ref6.record,
          context = _ref6.context;

      this.__checkRecord(record);
      if (this.__sync) {
        return this.__sync.context(context).create(record).then(function (record) {
          // r is the updated version of record (with __cid set)
          var r = this.__add(record);
          return Promise.resolve(r);
        }.bind(this));
      } else {
        this.__add(record);
        return Promise.resolve(record);
      }
    }
  }, {
    key: "create",
    value: function create() {
      this.__create.apply(this, arguments).then(function (record) {
        this.emit(this.events.change);
        this.emit(this.events.create, record);
      }.bind(this)).catch(function (error) {
        this.emit(this.events.error, error);
      }.bind(this));
    }
  }, {
    key: "__update",
    value: function __update() {
      var _ref7 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          record = _ref7.record,
          context = _ref7.context;

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
        return this.__sync.context(context).update(record).then(function (record) {
          this.__edit(record);
          return Promise.resolve(record);
        }.bind(this));
      } else {
        this.__edit(record);
        return Promise.resolve(record);
      }
    }
  }, {
    key: "update",
    value: function update() {
      this.__update.apply(this, arguments).then(function (record) {
        this.emit(this.events.change);
        this.emit(this.events.update, record);
      }.bind(this)).catch(function (error) {
        this.emit(this.events.error, error);
      }.bind(this));
    }
  }, {
    key: "__delete",
    value: function __delete() {
      var _ref8 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          record = _ref8.record,
          context = _ref8.context;

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
        return this.__sync.context(context).delete(record).then(function (record) {
          this.__remove(record);
          return Promise.resolve(record);
        }.bind(this));
      } else {
        this.__remove(record);
        return Promise.resolve(record);
      }
    }
  }, {
    key: "delete",
    value: function _delete() {
      this.__delete.apply(this, arguments).then(function (record) {
        this.emit(this.events.change);
        this.emit(this.events.delete, record);
      }.bind(this)).catch(function (error) {
        this.emit(this.events.error, error);
      }.bind(this));
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
}(_events.EventEmitter);

BaseStore.compose = function (behaviors) {
  if (!Array.isArray(behaviors)) {
    throw new Error("behaviors must be an array");
  }
  return behaviors.reduce(function (a, b) {
    return b(a);
  }, BaseStore);
};

exports.default = BaseStore;