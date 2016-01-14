"use strict";

export let FilterableActions = ComposedActions => class extends ComposedActions {

  filter(_criterion, _keys) {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.filter,
      criterion: _criterion,
      keys: _keys
    })
  }

  resetFilter() {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.resetFilter,
    })
  }
};
