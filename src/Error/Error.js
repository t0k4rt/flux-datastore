"use strict";

import ErrorActions from './ErrorActions';
import ErrorStore from './ErrorStore';
import Constants from '../Constants';
import Record from '../Record';
import {Dispatcher} from "flux";

export default new Dispatcher();

let errorConstants= new Constants("error", {
  create: "create",
  delete: "delete",
  clear: "clear"
});

let d = new Dispatcher();

let ErrorRecord = new Record({message: null, ttl: 4000});
let _ErrorStore =  new ErrorStore(ErrorRecord, errorConstants, d);
let _ErrorActions = new ErrorActions(errorConstants, d);

export default {
  ErrorRecord: ErrorRecord,
  ErrorStore: _ErrorStore,
  ErrorActions: _ErrorActions
};

export { ErrorRecord, _ErrorStore as ErrorStore, _ErrorActions as ErrorActions };

