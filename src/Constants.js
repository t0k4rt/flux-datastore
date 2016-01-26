"use strict";

import Immutable from 'immutable';

class Constants {

  constructor(namespace, actions) {
    this.namespace = namespace;

    // map with action names / internal action type used in dispatcher
    this.actions = Object.assign({
      create:  "create",
      update:  "update",
      delete:  "delete"
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

  getTypeFromAction(_action) {
    return this.__dict.get(_action);
  }
}

export default Constants
