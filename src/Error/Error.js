"use strict";

import ErrorActions from './ErrorActions';
import ErrorStore from './ErrorStore';
import Constants from '../Constants';
import Record from '../Record';

let errorConstants= new Constants("error", {
  create: "create",
  delete: "delete",
  clear: "clear"
});

let ErrorRecord = new Immutable.Record({message: null, ttl: 2000});

export const store = new ErrorStore(ErrorRecord, errorConstants);
export const actions = new ErrorActions(errorConstants);
