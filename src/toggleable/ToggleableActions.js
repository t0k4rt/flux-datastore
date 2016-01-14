"use strict";

export let ToggleableActions = ComposedActions => class extends ComposedActions {

  toggle(_record, _context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.toggle,
      record: _record,
      context: _context||{}
    })
  }
};
