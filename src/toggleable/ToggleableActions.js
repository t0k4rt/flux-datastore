"use strict";
import Actions from "../Actions";

export let Toggleable = ComposedActions => class extends Actions {

  toggle(_record, _context) {
    this.dispatcher.dispatch({
      namespace: this.constants.namespace,
      type: this.constants.actions.toggle,
      record: _record,
      context: _context||{}
    })
  }
};
