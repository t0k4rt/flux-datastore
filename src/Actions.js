"use strict";

class Actions {
  constructor(_constants, _dispatcher) {
    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  create(_record, _context) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.create,
      record: _record,
      context: _context||{}
    })
  }

  update(_record, _context) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.update,
      record: _record,
      context: _context||{}
    })
  }

  delete(_record, _context) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.delete,
      record: _record,
      context: _context||{}
    })
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
