"use strict";
import Actions from "../Actions";

export let FilterableActions = ComposedActions => class extends Actions {

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
};
