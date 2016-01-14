"use strict";

import Immutable from "immutable";

class Actions {
  constructor(_constants, _dispatcher) {
    this.__constants = _constants;
    this.__dispatcher = _dispatcher;
    this.__waitFor = Immutable.Map();
  }

  create(_record, _context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.create,
      record: _record,
      context: _context||{}
    })
  }

  update(_record, _context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.update,
      record: _record,
      context: _context||{}
    })
  }

  delete(_record, _context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.delete,
      record: _record,
      context: _context||{},
    })
  }

  // experimental
  waitForWrapper(fn) {
    return function(...args) {
      // if we have to wait for something
      if(this.__waitFor.count()>0) {
        // we register a callback function
        this.dispatcher.register(function(payload){
          if(this.__waitFor.has(payload.type)) {
            // we get the token from the payload
            let token = this.__waitFor.get(payload.type)
            // we wait for the token
            this.__dispatcher.waitFor([token]);
            // we clean the waitFor
            this.__waitFor = this.__waitFor.delete(payload.type);
            // when the waitfor is empty, we can call the function
            if(this.__waitFor.count()==0) {
              fn(...args).bind(this);
            }
          }
        });
      } else {
        fn(...args).bind(this);
      }
    }.bind(this);
  }

  waitFor(store, action) {
    this.__waitFor = this.__waitFor.set(store.__dispatchToken, store.conastants.getTypeFromAction(action));
    return this;
  }
}

Actions.compose = (behaviors) => {
  if(!Array.isArray(behaviors)) {
    throw new Error("behaviors must be an array");
  }
  return behaviors.reduce(
    function(a, b) {
      return b(a);
    },
  Actions);
};

export default Actions
