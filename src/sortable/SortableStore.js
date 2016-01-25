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

  // If the values are numbers
  if(valueA === valueB)
    return 0;
  else
    return valueA > valueB ? 1 : -1;
};

export let SortableStore = ComposedStore => class extends ComposedStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    // is sortable flag
    this.isSortable = true;

    // sort
    this.events = Object.assign(this.events, {sort:   'sort'});
    this.__sortKeys = ["id"];
    this.__reverse = false;
    this.sortFunction = _defaultSortFunction;

    this.addListener("__reset", this.__resetSortable);
  }

  __resetSortable() {
    this.__sortKeys = ["id"];
    this.__reverse = false;
  }

  __sort(__collection) {
    let sortedCollection = __collection.sort(this.sortFunction.bind(this));
    return this.__reverse ? sortedCollection.reverse() : sortedCollection;
  }

  __sortPromise(__collection) {
    return Promise.Resolve(this.__sort(__collection));
  }

  getSorted() {
    return this.__sort(this.__collection.toSeq());
  }

  /*****************************/
  /** Sort collection section **/
  /*****************************/
  sort({keys}) {
    if(this.__sortKeys.join() != keys.join()) {
      this.__resetSortable();
      this.__reverse = true;
    }

    this.reverse();
    this.__sortKeys = keys || ["id"];
    this.emit(this.events.sort);
  }

  resetSort() {
    this.__resetSortable();
  }

  reverse() {
    this.__reverse = !this.__reverse;
  }
};
