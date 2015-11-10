"use strict";

import Immutable from "immutable";
import { EventEmitter } from "events";

let _defaultEvents = {
  change:   'change'
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

class ErrorStore extends EventEmitter {

  constructor(record, constants, __dispatcher) {
    super();
    this.constants = constants;
    this.record = record;

    // sort
    this.sortKeys = ["__cid"];

    // overridable base variables
    this.events = _defaultEvents;
    this.sortFunction = _defaultSortFunction;

    // PRIVATE IMPORTANT !!!!!
    this.__counter = 0;
    this.__collection = Immutable.Map();
    this.__dispatcher = __dispatcher;
    this.__dispatcher.register(this.payloadHandler.bind(this));
    this.__dict = Immutable.Map();
  }


  __add(r) {
    // on check que l'élément accepte les __cid
    if(r.has("__cid")) {
      // cid must be empty / null
      if(!r.get("__cid")) {
        // compute ttl
        let ttl;
        if(this.__collection.count() > 1) {
          ttl = this.__collection.toList().last().get("ttl");
          ttl += 500;
        }

        // set cid from internal collection counter
        this.__counter = this.__counter+1;
        r=r.set("__cid", "c"+this.__counter);
        if(ttl) {
          r = r.set("ttl", ttl);
        }
        // Set map with __cid and record
        this.__collection = this.__collection.set(r.get("__cid"), r);
        // add item to dict to be able to find it from id
        this.emit(this.events.change);
         window.setTimeout((function(){this.__remove(r)}).bind(this), r.get("ttl"));
      }
    } else {
      throw new Error("Model invalid, does not support __cid");
    }
  }

  __remove(r) {
    let cid = r.get("__cid");
    let id = r.get("id");
    this.__collection = this.__collection.remove(cid);
    this.emit(this.events.change);
  }

  getAll() {
    return this.__collection.sort(this.sortFunction.bind(this));
  }

  create({record}) {
    this.__add(record);
  }

  delete({record}) {
    if(record.get("__cid")) {
      this.__remove(record);
    } else {
      throw new Error("Cannot remove this record from collection, no __cid.");
    }
  }

  clear() {
    this.__collection = Immutable.Map();
    this.emit(this.events.change);
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

export default ErrorStore
