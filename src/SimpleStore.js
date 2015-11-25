"use strict";

import Immutable from "immutable";
import { EventEmitter } from "events";

let _defaultEvents = {
  change:   'change',
  success:  'success',
  filter:   'filter',
  sort:     'sort',
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
    this.__dispatcher.register(this.payloadHandler.bind(this));
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
        this.__sync
          .context(context)
          .fetchAll(this.__loadData.bind(this));
        window.setTimeout((function() { this.__initialized = false; }).bind(this), 10000);
      } else {
        this.__initialized = true;
      }
    }
  }

  initOne({context} = {}) {
    if(!this.__initialized) {
      if(this.__sync) {
        this.__sync
          .context(context)
          .fetch(this.__loadOne.bind(this));
        window.setTimeout((function() { this.__initialized = false; }).bind(this), 10000);
      } else {
        this.__initialized = true;
      }
    }
  }

  __parseModel(data) {
    return this.record.fromJS(data);
  }

  __parseCollection(data) {
    data.forEach((elt, index) => {
      let record = this.__parseModel(elt);
      this.__add(record);
    });
  }

  __loadOne(data) {
    this.__loadData([data]);
  }

  __loadData(data) {
    // on load data, dict and collection must be reset (or merged).
    this.__collection = Immutable.Map();
    this.__dict = Immutable.Map();

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
  __add(r) {
    // on check que l'élément accepte les __cid
    if(r.has("__cid")) {
      // cid must be empty / null
      if(!r.get("__cid")) {
        // when there is no sync, there is no id so we forge one
        // ! we do not override existing ids
        if(!this.__sync && !r.has("id")) {
          r = r.set("id", guid());
        }

        // set cid from internal collection counter
        this.__counter = this.__counter+1;
        r=r.set("__cid", "c"+this.__counter);

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

  __addWithEmit(r) {
    this.__add(r);
    this.emit(this.events.success);
    this.emit(this.events.change);
  }

  __edit(r) {
    this.__collection = this.__collection.set(r.get("__cid"), r);
    this.emit(this.events.success);
    this.emit(this.events.change);
  }

  __remove(r) {
    let cid = r.get("__cid");
    // force id to string
    let id = (r.get("id")).toString();
    this.__collection = this.__collection.remove(cid);
    this.__dict = this.__dict.remove(id);
    this.emit(this.events.success);
    this.emit(this.events.change);
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
      if(this.__dict.get(id) == r.get("__cid")) {
        console.warn("Record has been already indexed: ", id);
      } else {
        throw new Error("Record with id :"+ id +"does not match with index");
      }
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
        return Promise.resolve(this.__getByCid(cid));
      } else if(!this.__initialized) {
        return this.__sync.fetch(id);
      }
    }
    return Promise.reject(new Error("missing id"));
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
      this.__sync
        .context(context)
        .create(record, this.__addWithEmit.bind(this));
    } else {
      this.__addWithEmit(record);
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
      return;
    }

    if(this.__sync) {
      this.__sync
        .context(context)
        .update(record, this.__edit.bind(this));
    } else {
      this.__edit(record);
    }
  }

  delete({record, context} = {}) {

    this.__assertRecord(record);

    if(record.get("__cid") && record.get("id")) {
      if(this.__sync) {
        this.__sync
          .context(context)
          .delete(record, this.__remove.bind(this));
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
