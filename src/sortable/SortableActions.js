"use strict";
import Actions from "../Actions";

export let SortableActions = ComposedActions => class extends Actions {
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
