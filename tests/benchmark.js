"use strict";
import Immutable from "immutable";
import { Dispatcher } from "flux";
import DataStore, {Record, Constants, BaseStore, Actions} from "../src/DataStore";

import { SortableStore, SortableActions, SortableConstants  } from "../src/sortable/SortableBehavior";

import Benchmark from 'benchmark';
import faker from 'faker';



let suite = new Benchmark.Suite;
let testDispatcher = new Dispatcher();

let k = new Constants("k", Object.assign({},SortableConstants));
let ComposedStore = BaseStore.compose([SortableStore]);


let tr = Record({__cid:null, id: null, nom:null, prenom:null});
let ts = new ComposedStore(tr, k, testDispatcher);


let dataCollection = [];
let i = 0;
while(i < 5000) {
  dataCollection.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
  i++;
}

i=0;
let dataCollection2 = [];
while(i < 10000) {
  if(Math.random() > 0.5) {
    dataCollection2.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
  }
  i++;
}


//console.log("Generated fake data", dataCollection);
// let dataCollectionModified = [];
// i = 0
// while(i < 10000) {
//   dataCollectionModified.push({id: i, a: "aba", b: "abb"});
//   i++;
// }

// let s,e;
// console.log("parse dataCollection");
// s = performance.now();
// ts.__loadData(dataCollection);
// e = performance.now();
// console.log("dataCollection timing",e-s);
// console.log("size",ts.__collection.count());

// console.log("parse dataCollection");
// s = performance.now();
// ts.__loadData(dataCollection);
// e = performance.now();
// console.log("dataCollection timing",e-s);
// console.log("size",ts.__collection.count());

// console.log("parse dataCollection2");
// s = performance.now();
// ts.__loadData(dataCollection2);
// e = performance.now();
// console.log("dataCollection2 timing",e-s);
// console.log("size",ts.__collection.count());


let tableRecord = ts.__getCurrentTable();

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
.add("2/   test __parseResult", function() {
  ts.__parseResult(dataCollection, tableRecord);
})
.add("3/   test __parseResultBis", function() {
  ts.__parseResultBis(dataCollection, tableRecord);
})

// .add("3/   test __loadData", function() {
//   ts.__parseResult(dataCollection2);
//   //console.log("test __loadData map size",ts.__collection.count());
// })

// .add("2 bis/   test __loadData", function() {
//   ts.__loadDataBis(dataCollection);
//   //console.log("test __loadData map size",ts.__collection.count());
// })

// .add("3/   test create map from raw json", function() {
//   let list = Immutable.fromJS(dataCollection);
//   //console.log("immutable constructor map size",list.count());
// })

// .add("4/   test create map with foreach", function() {
//   let map = Immutable.Map();
//   let i=1;
//   dataCollection.forEach(function(value){
//     let r = tr.fromJS(value);
//     r = r.set("__cid", "c"+i);
//     map = map.set("c"+i, r);
//   });

//   //let __dict = map.
//   //console.log("map with foreach map size",map.count());
// })

.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
// run async
.run();
//.run({ 'async': true });


