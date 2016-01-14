"use strict";

export let ToggleableActions = ComposedActions => class extends ComposedActions {

  toggle(_record, _context) {
    this.__dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.toggle,
      record: _record,
      context: _context||{}
    })
  }
};
