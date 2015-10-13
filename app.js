"use strict;"
import Datastore from "./SimpleStore";
import Constants from "./Constants";
import Actions from "./Actions";
import dispatcher from "./Dispatcher";
import Immutable from "immutable";
import {Record} from "immutable";

import XMLHttpRequestPromise from 'xhr-promise';

let TRecord = function(defaultValues, name) {
  return Record(Object.assign({_cid: null}, defaultValues), name);
}
// class TRecord extends Record {
//   constructor(defaultValues, name) {
//     super(Object.assign({_cid: null}, defaultValues), name);
//   }
// }

let record = TRecord({id: null, test: "test"});
let tr = new record();
console.log(tr.toJS());

Immutable.Record.constructor.prototype.fromJS = function(values) {
  var that = this;
  var nested = Immutable.fromJS(values, function(key, value){
    if(that.prototype[key] && that.prototype[key].constructor.prototype instanceof Immutable.Record){ return that.prototype[key].constructor.fromJS(value) }
    else { return value }
  })
  return this(nested);
}

let testConstants = new Constants("test");
let testActions = new Actions(testConstants);


let testRecord = Immutable.Record({id: "AZ12", a:1, b:2, _cid: null});

let testrecord = new testRecord();
testrecord = testrecord.set("_cid", 45);
console.log("testrecord", testrecord.toJS());

let testStore = new Datastore(testRecord, testConstants);


let logger = function(event) {
  console.log("logged event");
};


testStore.listenToChanges(logger);
testStore.triggerSearchAt = 0;

testActions.create(new testRecord({id: "Ag12", a: "5", b: "56"}));
testActions.create(new testRecord({id: "Ag15", a: "86", b: "78"}));
testActions.create(new testRecord({id: "Ag14", a: "9", b: "8"}));
testActions.create(new testRecord({id: "Ag16", a: "87", b: "7898"}));
testActions.create(new testRecord({id: "Ag19", a: "5", b: "780"}));

testActions.filter(8, ["a", "b"]);
testActions.sort();



console.log(testStore.getFiltered().toJS());
console.log(JSON.stringify(testStore.getAll()));



