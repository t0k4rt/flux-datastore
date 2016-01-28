"use strict";

export let PaginableActions = ComposedActions => class extends ComposedActions {

  next(_context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.next
    })
  },

  prev(_context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.prev
    })
  },

  first(_context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.first
    })
  },

  last(_context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.last
    })
  },

  goto(_pageNumber, _context) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.goto,
      pagertNumber: _pageNumber
    })
  }
};
