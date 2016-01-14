"use strict";

export let SelectableActions = ComposedActions => class extends ComposedActions {
  selectAll() {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.selectAll,
    })
  }

  deselectAll() {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.deselectAll,
    })
  }

  select(_record) {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.select,
      record: _record
    })
  }

  selectMultiple(_records) {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.selectMultiple,
      records: _records
    })
  }

  deselect(_record) {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.deselect,
      record: _record
    })
  }

  deselectMultiple(_records) {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.deselectMultiple,
      records: _records
    })
  }
};
