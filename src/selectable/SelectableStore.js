"use strict";
import BaseStore from "../BaseStore";
import Immutable from "immutable";

export let SelectableStore = ComposedStore => class extends BaseStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    // select
    this.events = Object.assign(this.events, {select: 'select'});
    this.__selection = Immutable.Map();
  }

  getSelection() {
    return this.__selection;
  }

  deselectAll() {
    this.__selection = this.__selection.clear();
  }

  selectAll() {
    this.__selection = this.__collection;
  }

  select({record}) {
    if(record.__cid && !this.__selection.has(record.__cid)) {
      this.__selection = this.__selection.set(record.__cid, record);
    } else {
      console.error("Record exists");
    }
  }

  deselect({record}) {
    if(record.__cid && this.__selection.has(record.__cid)) {
      this.__selection = this.__selection.delete(record.__cid);
    } else {
      console.error("Could not find record");
    }
  }
};





