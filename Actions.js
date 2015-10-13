/* @flow */
"use strict;"

import Immutable from 'immutable';
import _dispatcher from "./Dispatcher";

class Actions {
  constructor(_constants) {
    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  create(_record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: _record
    })
  }

  update(_record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.update,
      record: _record
    })
  }

  delete(_record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.delete,
      record: _record
    })
  }

  filter(_criterion, _keys) {
    this.dispatcher.dispatch({
      type: this.constants.actions.filter,
      criterion: _criterion,
      keys: _keys
    })
  }

  resetFilter() {
    this.dispatcher.dispatch({
      type: this.constants.actions.resetFilter,
    })
  }

  sort(_keys) {
    this.dispatcher.dispatch({
      type: this.constants.actions.sort,
      keys: _keys
    })
  }

  resetSort() {
    this.dispatcher.dispatch({
      type: this.constants.actions.resetSort,
    })
  }

  reverse() {
    this.dispatcher.dispatch({
      type: this.constants.actions.reverse,
    })
  }
}

export default Actions
