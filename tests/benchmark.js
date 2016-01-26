"use strict";
import Immutable from "immutable";
import { Dispatcher } from "flux";
import DataStore, {Record, Constants, BaseStore, Actions} from "../src/DataStore";

import { SortableStore, SortableActions, SortableConstants  } from "../src/sortable/SortableBehavior";

import Benchmark from 'benchmark';
var faker = require('faker');



let suite = new Benchmark.Suite;
let testDispatcher = new Dispatcher();

let k = new Constants("k", Object.assign({},SortableConstants));
let ComposedStore = BaseStore.compose([SortableStore]);


let tr = Record({__cid:null, id: null, nom:null, prenom:null});
let ts = new ComposedStore(tr, k, testDispatcher);


let dataCollection = [];
let i = 0;
while(i < 10000) {
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

// let s = performance.now();
// dataCollection = JSON.parse(JSON.stringify(dataCollection));
// let e = performance.now();
// console.log("timing",e-s);


// let s1 = performance.now();
// let map = Immutable.Map();
// let dict = Immutable.Map();
// let j=1;
// dataCollection.forEach(function(value){
//   let r = tr.fromJS(value);
//   r = r.set("__cid", "c"+j);
//   map = map.set("c"+j, r);
//   dict = dict.set(r.id, "c"+j);
//   ++j;
// });
// let e1 = performance.now();
// console.log("timing",e1-s1);
// console.log("map size", map.count());


  ts.__loadData(dataCollection);
  console.log("test __loadData map size",ts.__collection.count());

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


