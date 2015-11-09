"use strict";

class Actions {
  constructor(_constants, _dispatcher) {
    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  create(_record, _parents) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.create,
      record: _record,
      parents: _parents||[]
    })
  }

  update(_record, _parents) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.update,
      record: _record,
      parents: _parents||[]
    })
  }

  delete(_record, _parents) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.delete,
      record: _record,
      parents: _parents||[]
    })
  }

  filter(_criterion, _keys) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.filter,
      criterion: _criterion,
      keys: _keys
    })
  }

  resetFilter() {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.resetFilter,
    })
  }

  sort(_keys) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.sort,
      keys: _keys
    })
  }

  resetSort() {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.resetSort,
    })
  }

  reverse() {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.reverse,
    })
  }
}

export default Actions
