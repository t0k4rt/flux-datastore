"use strict";
import BaseStore from "../BaseStore";
import debounce from "lodash.debounce";

let _defaultSortFunction = function(a, b) {
  let valueA, valueB;
  if(this.__sortKeys.length > 0) {
    valueA = a.get(this.__sortKeys[0]);
    valueB = b.get(this.__sortKeys[0]);
  } else {
    valueA = a.get("__cid");
    valueB = b.get("__cid");
  }

  if(valueA === valueB)
    return 0;
  else
    return valueA > valueB ? 1 : -1;
};

export let SortableStore = ComposedStore => class extends BaseStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    // sort
    this.events = Object.assign(this.events, {sort:   'sort'});
    this.__sortKeys = ["id"];
    this.__reverse = false;
    this.sortFunction = _defaultSortFunction;
  }

  getSorted() {
    // always sort collection by id map
    let sortedCollection = this.__collection__.sort(this.sortFunction.bind(this));
    return this.__reverse ? sortedCollection.reverse() : sortedCollection;
  }

  // override __collection getter so that we always get a sorted collection
  get __collection() {
    return this.getSorted();
  }

  set __collection(collection) {
    this.__collection__ = collection;
  }

  /*****************************/
  /** Sort collection section **/
  /*****************************/
  sort({keys}) {
    this.resetSort();
    this.__sortKeys = keys||["id"];
    this.emit(this.events.sort);
  }

  resetSort() {
    this.__sortKeys = [];
    this.__reverse = false;
  }

  reverse() {
    this.__reverse = !this.__reverse;
  }
};





