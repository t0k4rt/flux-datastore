/* @flow */
"use strict;"
import Immutable from "immutable";
import { EventEmitter } from "events";
import _dispatcher from "./Dispatcher";

// var getValueAtPath = function getValueAtPath(object :Object, path :Array) {
//   if(typeof object === "Object") {
//     if(object.hasOwnProperty(path.first())) {
//       var key = path.shift();
//       object = object[key];
//       if(path.length === 0) {
//         return object;
//       }
//       return getValueAtPath(object, path);
//     } else {
//       return undefined;
//     }
//   } else {
//     throw new Error("object must be an Object");
//   }
// };



let _defaultEvents = {
  change: 'change',
  success: 'success',
  filter: 'filter',
  error: 'error'
};

let _defaultSortFunction = function(a, b) {
  let valueA, valueB;
  if(this.sortKeys.length > 0) {
    valueA = a.get(this.sortKeys.first());
    valueB = b.get(this.sortKeys.first());
  } else {
    valueA = a.getIn(this.idMap);
    valueB = b.getIn(this.idMap);
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

  constructor(record, constants) {
    super();
    this.constants = constants;
    this.record = record;
    this.triggerSearchAt = 3;

    // parsing id mapping
    this.idMap = ["id"];

    // filter
    this.filterStr = "";
    this.filterKeys = [];

    // sort
    this.sortKeys = [];
    this.reverse = false;

    // overridable base variables
    this.events = _defaultEvents;
    this.sortFunction = _defaultSortFunction;
    this.filterFunction = _defaultFilterFunction;

    // IMPORTANT !!!!!
    this.collection = Immutable.Map();
    this.filteredCollection;
    this.dispatcher = _dispatcher;
    this.dispatcher.register(this.payloadHandler.bind(this));
  }

  parseModel(data :Object) {
    return this.record.fromJS(data);
  }

  parseCollection(data :Array<Object>) {
    data.forEach((elt, index) => {
      let record = this.parseModel(elt);
      this.collection = this.collection.set(strVal(record.getIn(this.idMap)), record);
    });
    this.emit(this.events.change);
  }

  addRecord(record) {
    this.collection = this.collection.set(record.getIn(this.idMap).toString(), record);
    this.emit(this.events.change);
  }

  get(id) {
    return this.collection.get(id);
  }

  getAll() {
    // always sort collection by id map
    let sortedCollection = this.collection.sort(this.sortFunction.bind(this));
    return this.reverse ? sortedCollection.reverse() : sortedCollection;
  }

  getFiltered() {
    let sortedCollection = this.filteredCollection.sort(this.sortFunction.bind(this));
    return this.reverse ? sortedCollection.reverse() : sortedCollection;
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

  /**********************/
  /**  actions handler **/
  /**********************/
  create({record}) {
    this.addRecord(record);
  }

  update({record}) {
    let originalRecord = this.collection.get(record.getIn(this.idMap));

    if(originalRecord) {
      // only sync if model was modified
      if(!Immutable.is(record, originalRecord)) {
        this.collection.set(record.getIn(this.idMap), record);
      }
    } else {
      console.log('you should create and not update');
    }
  }

  delete({record}) {
    this.collection.remove(record.getIn(this.idMap));
  }

  /*******************************/
  /** filter collection section **/
  /*******************************/
  filter({criterion, keys}) {
    this.filterStr = criterion.toString();
    this.filterKeys = keys;

    if(this.filterStr.length > this.triggerSearchAt) {
      this.refreshFilteredCollection();
      this.emit(this.events.filter);
    }
  }

  resetFilter() {
    this.criterion = undefined;
    this.filteredCollection = undefined;
  }

  refreshFilteredCollection() {
    this.filteredCollection = this.collection.filter(this.filterFunction.bind(this));
  }

  /*****************************/
  /** Sort collection section **/
  /*****************************/
  sort({keys}) {
    this.sortKeys = keys||[];
    this.emit(this.events.sort);
  }

  resetSort() {
    this.sortKeys = [];
    this.reverse = false;
  }

  reverse() {
    this.reverse = !this.reverse;
  }
}

export default SimpleStore
