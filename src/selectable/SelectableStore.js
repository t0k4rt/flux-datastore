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
          let records = [];
          result.forEach(function(elt) {
            if(elt.hasOwnProperty(this.idMap)) {
              records.push(this.get(elt[this.idMap]));
            }
          });
          this.selectMultiple({records: records})

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

  selectMultiple({records}) {
    records.forEach(function(record) {
      this.__select(record);
    });
    this.emit("select");
  }

  __select(record) {
    if(record && record.__cid) {
      if(!this.__selection.has(record.__cid)) {
        this.__selection = this.__selection.set(record.__cid, record);
      }
    } else {
      throw new Error("Bad record");
    }
  }

  select({record}) {
    this.__select(record);
    this.emit("select");
  }

  __deselect(record) {
    if(record.__cid && this.__selection.has(record.__cid)) {
      this.__selection = this.__selection.delete(record.__cid);
      this.emit("select");
    } else {
      throw new Error("Cannot deselect record with id: "+record.id +", could not find record in selection.");
    }
  }

  deselect({record}) {
    this.__deselect(record);
    this.emit("select");
  }
};





