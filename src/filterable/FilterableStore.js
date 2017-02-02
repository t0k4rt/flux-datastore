"use strict";
import BaseStore from "../BaseStore";
import debounce from "lodash.debounce"


let _defaultFilterSingleFunction = function(value, key) {
  let result = false;
  for(let field of this.filterKeys) {

    let valueLowered = null;
    let valueField = value;

    // If there is field nested
    if(field.indexOf('.') != -1) {
      let fields = field.split('.');

      for (let i = 0; i < fields.length; i++) {
        valueField = valueField.get(fields[i]);
      }
    }
    else {
      valueField = valueField.get(field);
    }

    // Lower string or object
    if(valueField) {
      if(typeof valueField == 'string') {
        valueLowered = valueField.toLowerCase();
      }
      else if(typeof valueField == 'number') {
        valueLowered = String(valueField);
      }
      else if(typeof valueField == 'object') {
        valueLowered = valueField.map(function(value) {
          return value.toLowerCase();
        });
      }
    }

    for(let criterion of this.filterCriteria) {
      if(value.get(criterion) && value.get(criterion).indexOf(this.filterCriteria.get(criterion)) == 0) {
        result = true;
        break;
      }
    }

    if (valueLowered && valueLowered.indexOf(this.filterStr.toLowerCase()) == 0) {
      result = true;
      break;
    }
  }
  return result;
};

let _defaultFilterMultipleFunction = function(value, key) {
  let result = true;

  // By default the result will be true, here we check all the values passed in the research form
  // And if ONE value is not found we return false. Its a research by addition

  // 1. Loop on each criterion available for the search
  for(let criterion in this.filterCriteria) {
    let valueLowered = null;

    // 2. We lower case all the values
    if(value.get(criterion)) {
      if(typeof value.get(criterion) == 'string') {
        valueLowered = value.get(criterion).toLowerCase();
      }
      else if(typeof value.get(criterion) == 'number') {
        valueLowered = String(value.get(criterion));
      }
      else if(typeof value.get(criterion) == 'object') {
        valueLowered = value.get(criterion).map(function(value) {
          return value.toLowerCase();
        });
      }
    }

    // 3. Check if the values set in the research is NOT in the list
    if(valueLowered) {
      // 3a. If the criterion value is an Array (Ex. Tags) we run a loop in order to compare each tags
      if(Array.isArray(this.filterCriteria[criterion])) {
        if(this.filterCriteria[criterion].length > 0) {
          for(let i = 0; i < this.filterCriteria[criterion].length; i++) {
            if(valueLowered.indexOf(this.filterCriteria[criterion][i].toLowerCase()) != 0) {
              result = false;
            }
          }
        }
      }
      // 3b. Else we just compare the criterion value with the list
      else {
        if(valueLowered.indexOf(this.filterCriteria[criterion].toLowerCase()) != 0) {
          result = false;
        }
      }
    }
    else {
      // If we research in an empty value = NO result
      if(this.filterCriteria[criterion].length > 0) {
        result = false;
      }
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
    this.filterCriteria = [];
    this.filterSingleFunction = _defaultFilterSingleFunction;
    this.filterMultipleFunction = _defaultFilterMultipleFunction;
    this.filterFunction = this.filterSingleFunction;
    this.__filtering = false;
    this.__debouncedelay = 300;

    // debounced emitfilter, it's easier than debouncing filter function
    this.__emitFilter = debounce(
      function() {
        if (this.filterStr.length > 0 || Object.keys(this.filterCriteria).length > 0) {
          this.emit(this.events.filter);
        }
      }
      , this.__debouncedelay).bind(this);

    this.addListener("__reset", this.__resetFilterable);
  }

  __resetFilterable (){
    this.filterStr = "";
    this.filterKeys = [];
    this.filterCriteria = [];
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
    this.filterFunction = this.filterSingleFunction;
    if(this.filterStr.length === 0) {
      this.resetFilter();
    } else {
      this.__filtering = true;
      this.__emitFilter();
    }
  }

  filterMultiple({criteria}) {
    this.filterCriteria = criteria;
    this.filterFunction = this.filterMultipleFunction;
    if(this.filterCriteria.length === 0) {
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
