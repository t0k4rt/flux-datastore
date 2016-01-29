"use strict";

export let PaginableActions = ComposedActions => class extends ComposedActions {

  next() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.next
    })
  }

  prev() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.prev
    })
  }

  first() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.first
    })
  }

  last() {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.last
    })
  }

  goto(_pageNumber) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.goto,
      pagertNumber: _pageNumber
    })
  }

  goto(_itemsPerPage) {
    this.__dispatcher.dispatch({
      namespace: this.__constants.namespace,
      type: this.__constants.actions.setItemsPerPage,
      itemsPerPage: _itemsPerPage
    })
  }
};
