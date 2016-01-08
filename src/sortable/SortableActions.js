"use strict";

export let SortableActions = ComposedActions => class extends ComposedActions {
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
};
