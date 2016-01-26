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
    this.idMap = "id";

    //todo: implement dirty records
    this.optimisticUpdate = false;

    // overridable base variables
    this.events = _defaultEvents;

    // PRIVATE IMPORTANT !!!!!
    this.__counter = 0;
    this.__collection = Immutable.Map();
    this.__dispatcher = __dispatcher;
    this.__dispatchToken = this.__dispatcher.register(this.payloadHandler.bind(this));
    this.__dict = Immutable.Map();
    this.__sync = sync;
  }

  /********************/
  /**  Init scripts  **/
  /********************/
  init({context, params} = {}) {
    if(this.__sync) {
      return this.__sync
        .context(context)
        .fetchAll(params)
        .then(function(result){
          return Promise.resolve(this.__loadData(result));
        }.bind(this));
    } else {
      return Promise.resolve(this.getAll())
    }
  }

  initOne({id, context, params} = {}) {
    if(this.__sync) {
      return this.__sync
        .context(context)
        .fetch(id, params)
        .then(function(result){
          return Promise.resolve(this.__loadData([result]));
        }.bind(this))
        .then(function(){
          return Promise.resolve(this.get(id));
        }.bind(this));
    } else {
      return Promise.resolve(this.get(id));
    }
  }

  refresh({record, context, params} = {}) {
    let id = record.get("id");
    if(this.__sync) {
      return this.__sync
        .context(context)
        .fetch(id, params)
        .then(function(result){
          let newRecord = this.__parseModel(result);
          let oldRecord = this.get(id);
          // we check that record already exists
          if(oldRecord) {
            //copy old record cid to new record cid.
            this.__edit(newRecord.set("__cid", oldRecord.get("__cid")));
          } else {
            // if record not exists we add it to collection
            this.__add(newRecord);
          }
          return Promise.resolve(this.get(id));
        }.bind(this));
    } else {
      return Promise.resolve(this.get(id));
    }
  }

  __loadData(data) {
    this.__collection = this.__collection.clear();
    this.__dict = this.__dict.clear();
    this.__parseCollection(data);

    return this.getAll();
  }

  __loadDataBis(data) {
    this.__collection = Immutable.Map();
    this.__dict = Immutable.Map();
    this.__parseCollection(data);

    return this.getAll();
  }

  __parseCollection(data) {
    data.forEach((elt, index) => {
      let record = this.__parseModel(elt);
      this.__add(record);
    });
  }

  __parseModel(data) {
    return this.record.fromJS(data);
  }

  __computeDiff(toCompare, criterion) {
    let __ids = this.__dict.flip().toList().toArray();
    let __diff = [];
    toCompare.forEach(function(value){
      if(__ids.indexOf((value[criterion]).toString()) === -1) {
        __diff.push(value);
      }
    });
    return __diff;
  }

  __loadDiffData(data) {
    let diff = this.__computeDiff(data, this.idMap);
    this.__parseCollection(diff);
    return this.getAll();
  }

  __mergeData(data) {
    //todo : do data merge here but it is complicated
  }

  /********************/
  /**  Base methods  **/
  /********************/

  __add(r) {
    // if cid is not empty it means it wal already added, this should not throw an error, but maybe we should trigger an edit
    if(!r.get("__cid")) {
      // set cid from internal collection counter
      this.__counter = this.__counter+1;
      r=r.set("__cid", "c"+this.__counter);

      // if sync is not set and id is not set, we forge a new id
      // when id is already set, we conserve it
      if(!this.__sync && !r.get("id")) {
        r = r.set("id", guid());
      }

      // Set map with __cid and record
      this.__collection = this.__collection.set(r.get("__cid"), r);

      // add item to dict to be able to find it from id
      this.__addToDict(r);

      return r;
    } else {
      console.warn("Record has been already added to the collection.")
    }
  }

  __edit(r) {
    if(r.get("__cid")
      && this.__collection.has(r.get("__cid")))
    {
      this.__collection = this.__collection.set(r.get("__cid"), r);
    } else {
      throw Error("Cannot edit record.");
    }
  }

  __remove(r) {
    if(r.get("__cid")
      && this.__collection.has(r.get("__cid"))
      && this.__dict.has(r.get("id").toString()))
    {
      this.__collection = this.__collection.remove(r.get("__cid"));
      this.__dict = this.__dict.remove(r.get("id").toString());
    } else {
      throw Error("Cannot remove record.");
    }
  }

  __addToDict(r) {
    // check if id is set
    if(!r.get("id")) {
      throw new Error("Cannot index record without id.");
    }
    // force id to string
    let id = r.get("id").toString();
    // check if record has not already been indexed
    if(this.__dict.has(id)) {
      console.warn("Record has been already indexed.", id);
    } else {
      this.__dict = this.__dict.set(id, r.get("__cid"));
    }
  }

  __getByCid(cid) {
    return this.__collection.get(cid);
  }

  __checkRecord(_record) {
    if(!(_record instanceof Immutable.Record)) {
      throw new Error("The record instance needs to be an instance of Immutable.Record");
    }

    if(!_record.has("__cid")) {
      throw new Error("The record instance needs to have a __cid key");
    }
  }

  /********************/
  /** Public getters **/
  /********************/

   get(id) {
    if(id) {
      // force id to string
      id = id.toString();
      let cid = this.__dict.get(id)||-1;

      console.log("cid check",cid, this.__dict.get(id));
      // should return undefind if id does not exist
      return this.__getByCid(cid);
    }
    throw Error("missing id");
  }

  getAll() {
    return this.__collection;
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
