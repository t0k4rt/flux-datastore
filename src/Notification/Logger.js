"use strict";

import LoggerActions from './LoggerActions';
import LoggerStore from './LoggerStore';
import Constants from '../Constants';
import { LoggerRecord, levels } from './LoggerRecord';
import { Dispatcher } from "flux";

export default new Dispatcher();

let LoggerConstants= new Constants("error", {
  create: "create",
  delete: "delete",
  dismiss: "dismiss",
  dismissAll: "dismiss_all"
});

let d = new Dispatcher();
let _LoggerStore =  new LoggerStore(LoggerRecord, LoggerConstants, d);
let _LoggerActions = new LoggerActions(LoggerConstants, d);

export default {
  LoggerStore: _LoggerStore,
  LoggerActions: _LoggerActions
};

export { _LoggerStore as LoggerStore, _LoggerActions as LoggerActions };

