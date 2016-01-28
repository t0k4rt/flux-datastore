"use strict";

import Immutable from "immutable";
import { EventEmitter } from "events";

let _defaultEvents = {
  init:     'init',
  initOne:  'initOne',
  change:   'change',
  create:   'create',
  update:   'update',
  delete:   'delete',
  error:    'error'
};

// GUID generator when there is no sync
let guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

class BaseStore extends EventEmitter {

  constructor(record, constants, __dispatcher, sync) {
    super();
    this.constants = constants;
    this.record = record;

    // set what parameter from the record is used as id
    this.idMap = "id";

    //todo: implement dirty records
    this.optimisticUpdate = false;

    // overridable base variables
    this.events = _defaultEvents;

    // data ttl in local db
    this.__ttl = 10000; //ms
    this.__tableRecord = Immutable.Record({__counter:0, __collection:Immutable.Map(), __dict: Immutable.Map(), __expire: Date.now()-this.__ttl});

    // init db
    this.__key = this.__generateKey({}, {});
    this.__db = Immutable.Map().set(this.__key, new this.__tableRecord());
    this.__useCache = true;

    // list of parameters to reset when init is called;
    this.__toReset = [];

    // internal
    this.__dispatcher = __dispatcher;
    this.__dispatchToken = this.__dispatcher.register(this.payloadHandler.bind(this));

    // backend sync class
    this.__sync = sync;
  }


  /*********************************/
  /**  get set overrides scripts  **/
  /*********************************/
  // override collection
  get collection() {
    return this.__collection;
  }

  set collection(collection) {
    this.__collection = collection;
  }

  // override __collection
  get __collection() {
    return this.__db.getIn([this.__key, "__collection"]);
  }

  set __collection(collection) {
    this.__db = this.__db.setIn([this.__key, "__collection"], collection);
  }

  // override __collection
  get __dict() {
    return this.__db.get(this.__key).get("__dict");
  }

  get key() {
    return this.__key;
  }

  set key(key) {
    // this means we change table so we should reset some parameters
    if(key != this.__key) {
      this.emit("__reset");
    }
    this.__key = key;
  }


  /****************/
  /**  DB Utils  **/
  /****************/

  __generateKey(context, params) {
    return Immutable.fromJS(Object.assign({ns: this.constants.namespace}, context, params));
  }

  __getCurrentTable() {
    return this.__db.get(this.__key);
  }

  __updateTable(table) {
    this.__db = this.__db.set(this.__key, table);
    return Promise.resolve(table);
  }

  __loadData(data) {
    this.__updateTable(this.__parseResult(data, this.__getCurrentTable()))
    .then(function(table){
      //console.log("table updated", table);
    });
    return this.getAll();
  }


  /****************/
  /**   Parsing  **/
  /****************/

  __parseResult(data, table) {

    if(!table) {
      table = new this.__tableRecord();
    }

    let __dict = table.get("__dict");
    let __collection = table.get("__collection");
    let __counter = table.get("__counter");


    data.forEach((elt) => {
      let id = elt.id.toString();
      if(!__dict.has(id)) {

        let r = this.__parseModel(elt);
        let __cid = `c${__counter}`;

        r = r.set("__cid", __cid);
        __collection = __collection.set(__cid, r);
        __dict = __dict.set(r.id.toString(), __cid);
        ++__counter;

      } else {
        let __cid = __dict.get(id);
        let r = this.__parseModel(elt);
        r = r.set("__cid", __cid);
        if(!Immutable.is(r, __collection.get(__cid))) {
          //console.log("got different data", r.toJS());
          __collection = __collection.set(__cid, r);
        }
      }
    });

    //update table
    table = table.withMutations(map => {
      map.set("__dict", __dict).set("__collection", __collection).set("__counter", __counter).set("__expire", Date.now());
    });

    return table;
  }

  __parseModel(data) {
    return this.record.fromJS(data);
  }

  /********************/
  /**  Init scripts  **/
  /********************/
  init({context, params} = {}) {
    this.key = this.__generateKey(context, params);
    let table = this.__getCurrentTable();

    // We only fetch when :
    // sync exists
    // table does not exist
    // table expire date has expired and sync is defined
    if( (!table || (table && table.__expire <= (Date.now() - this.__ttl))) && this.__sync) {
    //if(this.__sync) {
      return this.__sync
      .context(context)
      .fetchAll(params)
      .then(function(result){
        return Promise.resolve(this.__parseResult(result, table));
      }.bind(this))
      .then(this.__updateTable.bind(this))
      .then(function() {
        return Promise.resolve(this.getAll());
      }.bind(this));
    } else {
      return Promise.resolve(this.getAll());
    }
  }

  initOne({id, context, params} = {}) {
    this.key = this.__generateKey(context, params);
    let table = this.__getCurrentTable();

    if( (!table || (table && table.__expire <= (Date.now() - this.__ttl))) && this.__sync) {
      return this.__sync
        .context(context)
        .fetch(id, params)
        .then(function(result){
          return Promise.resolve(this.__parseResult([result], table));
        }.bind(this))
        .then(this.__updateTable.bind(this))
        .then(function(){
          return Promise.resolve(this.get(id));
        }.bind(this));
    } else {
      return Promise.resolve(this.get(id));
    }
  }

  //todo : check this
  refresh({record, context, params} = {}) {
    this.key = this.__generateKey(context, params);
    let table = this.__getCurrentTable();

    if(this.__sync) {
      return this.__sync
        .context(context)
        .fetch(id, params)
        .then(function(result){
          return Promise.resolve(this.__parseResult([result], table));
        }.bind(this))
        .then(this.__updateTable.bind(this))
        .then(function(){
          return Promise.resolve(this.get(id));
        }.bind(this));
    } else {
      return Promise.resolve(this.get(id));
    }
  }


  /********************/
  /**  Base methods  **/
  /********************/

  __checkRecord(_record) {
    if(!(_record instanceof Immutable.Record)) {
      throw new Error("The record instance needs to be an instance of Immutable.Record");
    }

    if(!_record.has("__cid")) {
      throw new Error("The record instance needs to have a __cid key");
    }
  }

  __add(r) {
    // if cid is not empty it means it wal already added, this should not throw an error, but maybe we should trigger an edit
    if(!r.get("__cid")) {
      let table = this.__getCurrentTable();
      // set cid from internal collection counter
      r=r.set("__cid", `c${table.__counter}`);

      // if sync is not set and id is not set, we forge a new id
      // when id is already set, we conserve it
      if(!this.__sync && !r.get("id")) {
        r = r.set("id", guid());
      }

      // update collection, dict and counter
      let counter = table.__counter + 1;
      table = table.withMutations(function(t) {
        t.setIn(["__collection", r.get("__cid")], r)
        .setIn(["__dict", r.get("id").toString()], r.get("__cid"))
        .set("__counter", counter);
      });

      this.__updateTable(table);
      return r;

    } else {
      console.warn("Record has been already added to the collection.")
    }
  }

  __edit(r) {
    let table = this.__getCurrentTable();

    if(r.get("__cid")
      && table.__collection.has(r.get("__cid")))
    {
      table = table.setIn(["__collection", r.get("__cid")], r);
      this.__updateTable(table);
      return r;
    } else {
      throw Error("Cannot edit record.");
    }
  }

  __remove(r) {
    let table = this.__getCurrentTable();

    if(r.get("__cid")
      && table.__collection.has(r.get("__cid"))
      && table.__dict.has(r.get("id").toString()))
    {
      // Set map with __cid and record
      table = table.withMutations(function(t) {
        t.removeIn(["__collection", r.get("__cid")])
        .removeIn(["__dict", r.get("id").toString()]);
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

  getByCid(cid) {
    return this.__collection.get(cid);
  }

  get(id) {
    if(id) {
      // force id to string
      id = id.toString();
      let cid = this.__dict.get(id)||-1;

      // should return undefined if id does not exist
      return this.getByCid(cid);
    }
    throw Error("missing id");
  }

  getAll() {
    return this.collection;
  }


  /**********************/
  /**  actions handler **/
  /**********************/

  // todo : when dealing with record, we should check that it is an instance of Record
  __create({record, context} = {}) {
    this.__checkRecord(record);
    if(this.__sync) {
      return this.__sync
        .context(context)
        .create(record)
        .then(function(record){
          // r is the updated version of record (with __cid set)
          let r = this.__add(record);
          return Promise.resolve(r);
        }.bind(this))
    } else {
      this.__add(record);
      return Promise.resolve(record);
    }
  }

  create(...args) {
    this.__create(...args)
    .then(function(record) {
      this.emit(this.events.change);
      this.emit(this.events.create, record);
    }.bind(this))
    .catch(function(error){this.emit(this.events.error, error)}.bind(this));
  }

  __update({record, context} = {}) {
    this.__checkRecord(record);

    let originalRecord = this.__collection.get(record.get("__cid"));

    // check if record exist
    if(!originalRecord) {
      throw new Error("Record does not exist in collection.");
    }
    // can update ?
    if(!record.get("id")) {
      throw new Error("Cannot update non persisted entity.");
    }
    //don't edit and sync if records are equals.
    if(Immutable.is(record, originalRecord)) {
      return Promise.resolve(record);
    }

    if(this.__sync) {
      return this.__sync
        .context(context)
        .update(record)
        .then(function(record){
          this.__edit(record);
          return Promise.resolve(record);
        }.bind(this));
    } else {
      this.__edit(record);
      return Promise.resolve(record);
    }
  }

  update(...args) {
    this.__update(...args)
    .then(function(record) {
      this.emit(this.events.change);
      this.emit(this.events.update, record);
    }.bind(this))
    .catch(function(error){this.emit(this.events.error, error)}.bind(this));
  }

  __delete({record, context} = {}) {
    this.__checkRecord(record);

    // check if record exist in collection (we check __dict)
    if(!this.__dict.has(record.get("id").toString())) {
      throw new Error("Record does not exist in collection.");
    }

    // can update ?
    if(!record.get("id")) {
      throw new Error("Cannot update non persisted entity.");
    }

    if(this.__sync) {
      return this.__sync
        .context(context)
        .delete(record)
        .then(function(record){
          this.__remove(record);
          return Promise.resolve(record);
        }.bind(this));
    } else {
      this.__remove(record);
      return Promise.resolve(record);
    }
  }

  delete(...args) {
    this.__delete(...args)
    .then(function(record) {
      this.emit(this.events.change);
      this.emit(this.events.delete, record);
    }.bind(this))
    .catch(function(error){this.emit(this.events.error, error)}.bind(this));
  }

  /**********************/
  /** listener section **/
  /**********************/
  listenTo(eventName, callback) {
    this.on(eventName, callback);
  }

  stopListeningTo(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  listenToChanges(callback) {
    this.listenTo(this.events.change, callback);
  }

  stopListeningToChanges(callback) {
    this.stopListeningTo(this.events.change, callback);
  }

  /**************************/
  /** action proxy handler **/
  /**************************/
  payloadHandler(payload) {
    if(payload.namespace != this.constants.namespace) {
      return;
    }
    // get fn name from payload type
    let fn = this.constants.__dict.get(payload.type);
    // check if fn exists for current class
    if(fn && Reflect.has(this,fn)) {
      fn = Reflect.get(this,fn);
      Reflect.apply(fn, this, [payload]);
    } else {
      throw new Error('no function found for ' + fn);
    }
  }
}

BaseStore.compose = (behaviors) => {
  if(!Array.isArray(behaviors)) {
    throw new Error("behaviors must be an array");
  }
  return behaviors.reduce(
    function(a, b) {
      return b(a);
    },
  BaseStore);
};

export default BaseStore
