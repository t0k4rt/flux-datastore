/* @flow */
"use strict;"
import Immutable from "immutable";
import { EventEmitter } from "events";
import __dispatcher from "./Dispatcher";

let _defaultEvents = {
  load:     'load',
  change:   'change',
  success:  'success',
  filter:   'filter',
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

class SimpleStore extends EventEmitter {

  constructor(record, constants, sync) {
    super();
    this.constants = constants;
    this.record = record;
    this.triggerSearchAt = 3;
    this.idMap = "id";
    //todo
    this.optimisticUpdate = false;

    // filter
    this.filterStr = "";
    this.filterKeys = [];

    // sort
    this.sortKeys = [];

    // overridable base variables
    this.events = _defaultEvents;
    this.sortFunction = _defaultSortFunction;
    this.filterFunction = _defaultFilterFunction;

    // PRIVATE IMPORTANT !!!!!
    this.__reverse = false;
    this.__counter = 0;
    this.__collection = Immutable.Map();
    this.__filteredCollection;
    this.__dispatcher = __dispatcher;
    this.__dispatcher.register(this.payloadHandler.bind(this));
    this.__dict = Immutable.Map();
    this.__sync = sync;
    this.__initialized = false;
  }


  /********************/
  /**  Init scripts  **/
  /********************/
  init() {
    if(!this.__loaded) {
      if(this.sync) {
        this.sync.fetchAll(this.__loadData.bind(this));
      } else {
        this.__initialized = true;
      }
    }
  }

  __parseModel(data :Object) {
    return this.record.fromJS(data);
  }

  __parseCollection(data :Array<Object>) {
    data.forEach((elt, index) => {
      let record = this.__parseModel(elt);
      this.__add(record);
    });
    this.emit(this.events.change);
  }

  __loadData(data) {
    this.__parseCollection(data);
    this.__initialized = true;
    this.emit(this.events.change);
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

  __edit(r) {
    this.__collection = this.__collection.set(r.get("__cid"), r);
    this.emit(this.events.success);
    this.emit(this.events.change);
  }

  __remove(r) {
    let cid = r.get("__cid");
    let id = r.get("id");
    this.__collection = this.__collection.remove(cid);
    this.__dict = this.__dict.remove(id);
    this.emit(this.events.success);
    this.emit(this.events.change);
  }

  __addToDict(r) {
    let id = r.get("id");

    // check if id is set
    if(!id) {
      throw new Error("Cannot index record without id.");
    }

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


  /********************/
  /** Public getters **/
  /********************/

  get(id) {
    if(id) {
      let cid = this.__dict.get(id);
      if(cid) {
        return this.__getByCid(cid);
      } else {
        return undefined;
      }
    }
  }

  getAll() {
    // always sort collection by id map
    let sortedCollection = this.__collection.sort(this.sortFunction.bind(this));
    return this.__reverse ? sortedCollection.reverse() : sortedCollection;
  }

  getFiltered() {
    if(this.__filteredCollection instanceof Immutable.Map) {
      let sortedCollection = this.__filteredCollection.sort(this.sortFunction.bind(this));
      return this.__reverse ? sortedCollection.reverse() : sortedCollection;
    } else {
      return undefined;
    }
  }

  /**********************/
  /**  actions handler **/
  /**********************/

  // todo : when dealing with record, we should check that it is an instance of Record
  create({record}) {
    if(this.sync) {
      this.sync.create(record, this.__add.bind(this));
    } else {
      this.__add(record);
    }
  }

  update({record}) {
    // can update ?
    if(!record.get("id")) {
      throw new Error("Cannot update non synced entity.");
    }

    // should update ?
    let originalRecord = this.__collection.get(record.get("__cid"));
    if(Immutable.is(record, originalRecord)) {
      return;
    }

    if(this.sync) {
      this.sync.update(record, this.__edit.bind(this));
    } else {
      this.__edit(record);
    }
  }

  delete({record}) {
    if(record.get("__cid") && record.get("id")) {
      if(this.sync) {
        this.sync.update(record, this.__remove.bind(this));
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
  filter({criterion, keys}) {
    this.filterStr = criterion.toString();
    this.filterKeys = keys;

    if(this.filterStr.length > this.triggerSearchAt) {
      this.__refreshFilteredCollection();
      this.emit(this.events.filter);
    }
  }

  resetFilter() {
    this.criterion = undefined;
    this.__filteredCollection = undefined;
  }

  __refreshFilteredCollection() {
    this.__filteredCollection = this.__collection.filter(this.filterFunction.bind(this));
  }

  /*****************************/
  /** Sort collection section **/
  /*****************************/
  sort({keys}) {
    this.resetSort();
    this.sortKeys = keys||[];
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
  listenTo(eventName :string, callback) {
    this.on(eventName, callback);
  }

  stopListeningTo(eventName :string, callback) {
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
