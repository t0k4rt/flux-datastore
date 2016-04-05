"use strict";

export let FilterableActions = ComposedActions => class extends ComposedActions {

  filter(_criterion, _keys) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.filter,
      criterion: _criterion,
      keys: _keys
    })
  }

  filterMultiple(_criteria) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.filterMultiple,
      criteria: _criteria
    })
  }

  resetFilter() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.resetFilter,
    })
  }
};
