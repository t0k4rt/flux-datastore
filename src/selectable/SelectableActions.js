"use strict";

export let SelectableActions = ComposedActions => class extends ComposedActions {
  selectAll() {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.selectAll,
      keys: _keys
    })
  }

  deselectAll() {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.deselectAll,
      keys: _keys
    })
  }

  select(_record) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.select,
      record: _record
    })
  }

  deselect(_record) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.deselect,
      record: _record
    })
  }
};
