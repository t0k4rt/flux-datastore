"use strict";
import BaseStore from "../BaseStore";
import debounce from "lodash.debounce"


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


export let FilterableStore = ComposedStore => class extends ComposedStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    this.events = Object.assign(this.events, {filter:   'filter'});
    this.triggerFilterAt = 3;
    this.filterStr = "";
    this.filterKeys = [];
    this.filterFunction = _defaultFilterFunction;
    this.__filteredCollection;
    this.__filtering = false;
    this.__debouncedelay = 300;

    // debounced emitfilter
    this.__emitFilter = debounce(
      function() {
        if(this.filterStr.length > 0) {
          this.emit(this.events.filter);
        }
      }
      , this.__debouncedelay).bind(this);
  }

  getFiltered() {
    console.log("isfiltering", this.__filtering);
    if(this.__filtering) {
      return this.__collection.filter(this.filterFunction.bind(this));
    } else {
      return this.getAll();
    }
  }

  /*******************************/
  /** filter collection methods **/
  /*******************************/

  filter({criterion, keys}) {
    this.filterStr = criterion.toString();
    this.filterKeys = keys;
    if(this.filterStr.length === 0) {
      this.resetFilter();
    } else {
      this.__filtering = true;
      this.__emitFilter;
    }
  }

  resetFilter() {
    this.filterStr = "";
    this.__filtering = false;
    this.emit(this.events.filter);
  }
};
