import ErrorActions from './ErrorActions';
import ErrorStore from './ErrorStore';
import Constants from '../Constants';
import Record from '../Record';

let errorConstants= new Constants("error", {
  create: "create",
  delete: "delete",
  clear: "clear"
});

let actions = new ErrorActions(errorConstants);

let ErrorRecord = new Immutable.Record({message: null, ttl: 2000});

let store = new ErrorStore(ErrorRecord, errorConstants);


export store;
export actions;
