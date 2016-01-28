"use strict";
import BaseStore from "../BaseStore";
import debounce from "lodash.debounce"


let _defaultFilterFunction = function(value, key) {
  let result = false;
  for(let field of this.filterKeys) {
    if(value.get(field) && value.get(field).indexOf(this.filterStr) > -1) {
      result = true;
      break;
    }
  }
  return result;
};


export let FilterableStore = ComposedStore => class extends ComposedStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    // is filterable flag
    this.isFilterable = true;

    this.events = Object.assign(this.events, {filter:   'filter'});
    this.triggerFilterAt = 3;
    this.filterStr = "";
    this.filterKeys = [];
    this.filterFunction = _defaultFilterFunction;
    this.__filtering = false;
    this.__debouncedelay = 300;

    // debounced emitfilter, it's easier than debouncing filter function
    this.__emitFilter = debounce(
      function() {
        if(this.filterStr.length > 0) {
          this.emit(this.events.filter);
        }
      }
      , this.__debouncedelay).bind(this);

    this.addListener("__reset", this.__resetFilterable);
  }

  __resetFilterable (){
    this.filterStr = "";
    this.filterKeys = [];
    this.__filtering = false;
  }

  __filter(__collection) {
    if(this.__filtering) {
      return __collection.filter(this.filterFunction.bind(this));
    } else {
      return __collection;
    }
  }

  __filterPromise(__collection) {
    return Promise.Resolve(this.__filter(__collection));
  }

  getFiltered() {
    return this.__filter(this.__collection.toSeq());
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
      this.__emitFilter();
    }
  }

  resetFilter() {
    this.__resetFilterable();
    this.emit(this.events.filter);
  }
};
