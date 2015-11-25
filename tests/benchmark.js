"use strict";
import Immutable from "immutable";
import { Dispatcher } from "flux";
import DataStore, {Record, Constants, SimpleStore, Actions} from "../src/DataStore";
import Benchmark from 'benchmark';


let suite = new Benchmark.Suite;


let testDispatcher = new Dispatcher();

let namespace = "k";
let actions = {
    create: "create",
    update: "update",
    delete: "delete",
    filter: "filter",
    resetFilter: "reset_filter",
    sort: "sort",
    resetSort: "reset_sort",
    reverse: "reverse"
  };
let k = new Constants(namespace, actions);
let tr = Record({id: null, a:1, b:2});
let ts = new SimpleStore(tr, k, testDispatcher);
let ts2 = new SimpleStore(tr, k, testDispatcher);


let dataCollection = [];
let i = 0;
while(i < 10000) {
  dataCollection.push({id: i, a: "aaa", b: "bbb"});
  i++;
}

let dataCollectionModified = [];
i = 0
while(i < 10000) {
  dataCollectionModified.push({id: i, a: "aba", b: "abb"});
  i++;
}

suite.add("test __parseCollection", function() {
  ts.__parseCollection(dataCollection);
})
.add("test __parseCollectionWithSeq", function() {
  ts2.__parseCollectionWithSeq(dataCollection);
})// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run({ 'async': true });

