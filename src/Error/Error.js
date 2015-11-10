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

let ErrorRecord = new Record({message: null, ttl: 2000});

export default {
  ErrorRecord: ErrorRecord,
  ErrorStore: new ErrorStore(ErrorRecord, errorConstants, d),
  ErrorActions: new ErrorActions(errorConstants, d)
};
