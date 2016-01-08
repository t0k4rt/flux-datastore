"use strict";
import BaseStore from "../BaseStore";
import Immutable from "immutable";

export let SelectableStore = ComposedStore => class extends ComposedStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    // select
    this.events = Object.assign(this.events, {select: 'select'});
    this.__selection = Immutable.Map();
  }

  getSelection() {
    return this.__selection;
  }

  isSelected(record) {
    return this.__selection.has(record.__cid);
  }

  initSelection({context, params} = {}) {
    // the params should be used to filter data through api calls
    if(this.__sync) {
      return this.__sync
        .context(context)
        .fetchAll(params)
        .then(function(result){
          result.forEach(function(elt) {
            if(elt.hasOwnProperty(this.idMap)) {

              let record = this.get(elt[this.idMap]);
              if(record) {
                this.select(record);
              }
            }
          })
          return Promise.resolve(this.__loadData(result));
        }.bind(this));
    }
  }

  deselectAll() {
    this.__selection = this.__selection.clear();
    this.emit("select");
  }

  selectAll() {
    this.__selection = this.__collection;
    this.emit("select");
  }

  select({record}) {
    if(record && record.__cid && !this.__selection.has(record.__cid)) {
      this.__selection = this.__selection.set(record.__cid, record);
      this.emit("select");
    } else {
      console.error("Record exists");
    }
  }

  deselect({record}) {
    if(record.__cid && this.__selection.has(record.__cid)) {
      this.__selection = this.__selection.delete(record.__cid);
      this.emit("select");
    } else {
      console.error("Could not find record");
    }
  }
};





