"use strict";

export let SortableActions = ComposedActions => class extends ComposedActions {
  sort(_keys) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.sort,
      keys: _keys
    })
  }

  resetSort() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.resetSort,
    })
  }

  reverse() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.reverse,
    })
  }
};
