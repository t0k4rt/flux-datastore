"use strict";

class ErrorActions {
  constructor(_constants, _dispatcher) {
    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  create(_record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: _record
    })
  }

  delete(_record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.delete,
      record: _record
    })
  }

  dismissAll() {
    this.dispatcher.dispatch({
      type: this.constants.actions.dismissAll,
    })
  }

  dismiss(record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.dismiss,
      record: record
    })
  }
}

export default ErrorActions
