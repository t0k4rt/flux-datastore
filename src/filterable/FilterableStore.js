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
    this.__debouncedelay = 200;
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
      if(this.__filtering === true && this.filterStr.length === 0) {
        this.resetFilter();
      } else if(this.filterStr.length > 0) {
        this.emit(this.events.filter);
        this.__filtering = true;
      }

  }

  debouncedFilter({criterion, keys}) {
    let debounced =  debounce(function(criterion, keys) {
      this.filter({criterion, keys})
    }, this.__debouncedelay).bind(this);

    debounced.call(this, criterion, keys);
  }

  resetFilter() {
    this.filterStr = "";
    this.__filtering = false;
    this.emit(this.events.filter);
  }
};
