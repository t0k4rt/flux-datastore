/* @flow */
"use strict;"

import Immutable from 'immutable';

class Constants {

  constructor(namespace, actions) {
    this.namespace = namespace;
    this.actions = actions;

    this.constants = Object.freeze({
      CREATE:         namespace+"_create",
      UPDATE:         namespace+"_update",
      DELETE:         namespace+"_delete",
      FILTER:         namespace+"_filter",
      RESET_FILTER:   namespace+"_reset_filter",
      SORT:           namespace+"_sort",
      RESET_SORT:     namespace+"_reset_sort",
      REVERSE:        namespace+"_reverse"
    });

    this.dict = Immutable.Map(this.constants).flip();

    this.fnMap = Object.freeze({
      CREATE:         "create",
      UPDATE:         "update",
      DELETE:         "delete",
      FILTER:         "filter",
      RESET_FILTER:   "reset_filter",
      SORT:           "sort",
      RESET_SORT:     "reset_sort",
      REVERSE:        "reverse"
    });
  }
}

export default Constants
