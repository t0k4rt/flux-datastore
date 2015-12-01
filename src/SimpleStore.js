"use strict";

import Immutable from "immutable";
import { EventEmitter } from "events";

let _defaultEvents = {
  change:   'change',
  filter:   'filter',
  sort:     'sort',
  success:  'success',
  error:    'error'
};

let _defaultSortFunction = function(a, b) {
  let valueA, valueB;
  if(this.sortKeys.length > 0) {
    valueA = a.get(this.sortKeys[0]);
    valueB = b.get(this.sortKeys[0]);
  } else {
    valueA = a.get("__cid");
    valueB = b.get("__cid");
  }

  if(valueA === valueB)
    return 0;
  else
    return valueA > valueB ? 1 : -1;
};

let _defaultFilterFunction = function(value, key) {
  let result = false;
  for(let field of this.filterKeys) {
    if(value.get(field).indexOf(this.filterStr) > -1) {
      result = true;
      break;
    }
  }
  return result;
};

let guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4();
}

class SimpleStore extends EventEmitter {

  constructor(record, constants, __dispatcher, sync) {
    super();
    this.constants = constants;
    this.record = record;
    this.triggerSearchAt = 3;
    this.idMap = "id";

    //todo: implement dirty records
    this.optimisticUpdate = false;

    // filter
    this.filterStr = "";
    this.filterKeys = [];

    // sort
    this.sortKeys = ["id"];

    // overridable base variables
    this.events = _defaultEvents;
    this.sortFunction = _defaultSortFunction;
    this.filterFunction = _defaultFilterFunction;

    // PRIVATE IMPORTANT !!!!!
    this.__reverse = false;
    this.__counter = 0;
    this.__collection = Immutable.Map();
    this.__filteredCollection;
    this.__filtering = false;
    this.__dispatcher = __dispatcher;
    this.__dispatchToken = this.__dispatcher.register(this.payloadHandler.bind(this));
    this.__dict = Immutable.Map();
    this.__sync = sync;
    this.__initialized = false;
  }


  /********************/
  /**  Init scripts  **/
  /********************/
  init({context} = {}) {
    if(!this.__initialized) {
      if(this.__sync) {
        window.setTimeout((function() { this.__initialized = false; }).bind(this), 10000);
        return this.__sync
          .context(context)
          .fetchAll()
          .then(function(result){
            this.__initialized = true;
            return Promise.resolve(this.__loadData(result));
          }.bind(this));
      } else {
        this.__initialized = true;
      }
    } else {
      return Promise.resolve(this.getAll())
    }
  }

  initOne({id, context} = {}) {
    if(!this.__initialized) {
      if(this.__sync) {
        return this.__sync
          .context(context)
          .fetch(id)
          .then(function(result){
            return Promise.resolve(this.__loadData([result]));
          }.bind(this))
          .then(function(){
            return Promise.resolve(this.get(id));
          }.bind(this));
      } else {
        this.__initialized = true;
      }
    } else {
      return Promise.resolve(this.get(id));
    }
  }

  __loadData(data) {
    this.__collection = Immutable.Map();
    this.__dict = Immutable.Map();
    this.__parseCollection(data);

    return this.__collection;
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

  /********************/
  /**  Base methods  **/
  /********************/

  __add(r) {
    // on check que l'élément accepte les __cid
    if(r.has("__cid")) {
      // cid must be empty / null
      if(!r.get("__cid")) {
        // set cid from internal collection counter
        this.__counter = this.__counter+1;
        r=r.set("__cid", "c"+this.__counter);

        // when there is no sync, there is no id so we forge one
        if(!this.__sync) {
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

  __edit(r) {
    this.__collection = this.__collection.set(r.get("__cid"), r);
  }

  __remove(r) {
    let cid = r.get("__cid");
    // force id to string
    let id = (r.get("id")).toString();
    this.__collection = this.__collection.remove(cid);
    this.__dict = this.__dict.remove(id);
  }

  __addToDict(r) {
    // check if id is set
    if(!r.has("id") || !r.get("id")) {
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

  __assertRecord(_record) {
    if(!(_record instanceof Immutable.Record)) {
      throw new Error("The record instance needs to be an instance of Immutable.Record");
    }
  }

  /********************/
  /** Public getters **/
  /********************/

   get(id) {
    if(id) {
      // force id to string
      id = id.toString();
      let cid = this.__dict.get(id);
      if(cid) {
        return this.__getByCid(cid);
      } else {
        return undefined;
      }

    }
    throw Error("missing id");
  }

  getAll() {
    // always sort collection by id map
    let sortedCollection = this.__collection.sort(this.sortFunction.bind(this));
    return this.__reverse ? sortedCollection.reverse() : sortedCollection;
  }

  getFiltered() {
    if(this.__filtering) {
      let sortedCollection = this.__collection.filter(this.filterFunction.bind(this)).sort(this.sortFunction.bind(this));
      return this.__reverse ? sortedCollection.reverse() : sortedCollection;
    } else {
      let sortedCollection = this.__collection.sort(this.sortFunction.bind(this));
      return this.__reverse ? sortedCollection.reverse() : sortedCollection;
    }
  }

  /**********************/
  /**  actions handler **/
  /**********************/

  // todo : when dealing with record, we should check that it is an instance of Record
  create({record, context} = {}) {
    this.__assertRecord(record);
    if(this.__sync) {
      return this.__sync
        .context(context)
        .create(record)
        .then(function(record){
          this.__add(record);
          this.emit(this.events.change);
          this.emit(this.events.success);
          return Promise.resolve(record);
        }.bind(this))
        .catch(function(error){this.emit(this.events.error, error)}.bind(this));

    } else {
      this.__add(record);
      return Promise.resolve(record);
    }
  }

  update({record, context} = {}) {
    this.__assertRecord(record);

    // can update ?
    if(!record.get("id")) {
      throw new Error("Cannot update non synced entity.");
    }

    // should update and sync ?
    let originalRecord = this.__collection.get(record.get("__cid"));
    if(Immutable.is(record, originalRecord)) {
      this.__edit(record);
      return Promise.resolve(record);
    }

    if(this.__sync) {
      return this.__sync
        .context(context)
        .update(record)
        .then(function(record){
          this.__edit(record);
          this.emit(this.events.change);
          this.emit(this.events.success);
          return Promise.resolve(record);
        }.bind(this))
        .catch(function(error){this.emit(this.events.error, error)}.bind(this));

    } else {
      this.__edit(record);
      return Promise.resolve(record);
    }
  }

  delete({record, context} = {}) {
    this.__assertRecord(record);

    if(record.get("__cid") && record.get("id")) {
      if(this.__sync) {
        return this.__sync
          .context(context)
          .delete(record)
          .then(function(record){
            this.__remove(record);
            this.emit(this.events.change);
            this.emit(this.events.success);
            return Promise.resolve(record);
          }.bind(this))
          .catch(function(error){this.emit(this.events.error, error)}.bind(this));

      } else {
        this.__remove(record);
        return Promise.resolve(record);
      }
    } else {
      throw new Error("Cannot remove this record from collection, no __cid or id");
    }
  }

  /*******************************/
  /** filter collection section **/
  /*******************************/
  filter({criterion, keys}) {
    this.filterStr = criterion.toString();
    this.filterKeys = keys;

    if(this.filterStr.length > this.triggerSearchAt) {
      this.emit(this.events.filter);
      this.__filtering = true;
    } else if(this.__filtering === true) {
      this.resetFilter();
    }
  }

  resetFilter() {
    this.criterion = undefined;
    this.__filtering = false;
    this.emit(this.events.filter);
  }

  /*****************************/
  /** Sort collection section **/
  /*****************************/
  sort({keys}) {
    this.resetSort();
    this.sortKeys = keys||["id"];
    this.emit(this.events.sort);
  }

  resetSort() {
    this.sortKeys = [];
    this.__reverse = false;
  }

  reverse() {
    this.__reverse = !this.__reverse;
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
      console.error('no function found to handle ' + fn);
    }
  }
}

export default SimpleStore
