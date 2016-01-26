"use strict";
import Immutable from "immutable";
import { Dispatcher } from "flux";
import DataStore, {Record, Constants, BaseStore, Actions} from "../src/DataStore";
import Benchmark from 'benchmark';
var faker = require('faker');



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
let tr = Record({__cid:null, id: null, nom:null, prenom:null});
let ts = new BaseStore(tr, k, testDispatcher);



let dataCollection = [];
let i = 0;
while(i < 5000) {
  dataCollection.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
  i++;
}

//console.log("Generated fake data", dataCollection);
// let dataCollectionModified = [];
// i = 0
// while(i < 10000) {
//   dataCollectionModified.push({id: i, a: "aba", b: "abb"});
//   i++;
// }

suite
.add("1/   test simple array", function() {
  let map = {};
  let i = 1;
  dataCollection.forEach(function(value){
    map[i] = value;
    ++i;
  });
  //console.log("test simple array map size", Object.keys(map).length);
})

.add("2/   test __loadData", function() {
  ts.__loadData(dataCollection);
  //console.log("test __loadData map size",ts.__collection.count());
})

.add("3/   test create map from raw json", function() {
  let list = Immutable.fromJS(dataCollection);
  //console.log("immutable constructor map size",list.count());
})

.add("4/   test create map with foreach", function() {
  let map = Immutable.Map();
  let i=1;
  dataCollection.forEach(function(value){
    let r = tr.fromJS(value);
    r = r.set("__cid", "c"+i);
    map = map.set("c"+i, r);
  });

  //let __dict = map.
  //console.log("map with foreach map size",map.count());
})

.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run();
//.run({ 'async': true });

