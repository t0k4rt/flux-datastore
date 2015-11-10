"use strict";

import Immutable from 'immutable';

class Constants {

  constructor(namespace, actions) {
    this.namespace = namespace;

    // _actions
    this.actions = Object.assign({
      create: "create",
      update: "update",
      delete: "delete",
      filter: "filter",
      resetFilter: "reset_filter",
      sort: "sort",
      resetSort: "reset_sort",
      reverse: "reverse"
    }, actions);
  }

  set actions(obj) {
    for(let prop in obj) {
      if(obj.hasOwnProperty(prop)) {
        obj[prop] = this.namespace +"_"+ obj[prop];
      }
    }
    if(Object.keys(obj).length > 0) {
      this._actions = obj;
      this.updateDict();
    }
  }

  get actions() {
    return this._actions;
  }

  updateDict() {
    this.__dict = Immutable.Map(this.actions).flip();
  }
}

export default Constants
