
"use strict";
import Immutable from "immutable";
import { Dispatcher } from "flux";
import DataStore, {Record, Constants, BaseStore, Actions} from "../src/DataStore";
import { FilterableStore } from "../src/filterable/FilterableBehavior";
import { SortableStore } from "../src/sortable/SortableBehavior";
import { ToggleableStore } from "../src/toggleable/ToggleableBehavior";
import { SelectableStore } from "../src/selectable/SelectableBehavior";
import Benchmark from 'benchmark';
import faker from 'faker';

let testDispatcher = new Dispatcher();

QUnit.test("Test __computeDiff function", function( assert ) {
  let namespace = "k";
  let actions = {
    init:     'init',
    initOne:  'initOne',
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
  let tr = Record({id: null, nom:null, prenom:null});
  let ts = new BaseStore(tr, k, testDispatcher);

  let tableRecord = ts.__getCurrentTable();
  // test parse collection

  let dataCollection = [];
  let i = 0;
  while(i < 10000) {
    dataCollection.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
    i++;
  }

  i=0;
  let dataCollection2 = [];
  while(i < 10000) {
    if(Math.random() > 0.005) {
      dataCollection2.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
    }
    i++;
  }


  let dataCollection3 = dataCollection.concat([]);
  i=dataCollection3.length;
  while(i < 15000) {
    dataCollection3.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
    i++;
  }


  let dataCollection4 = [];
  i=0;
  while(i < 5000) {
    if(Math.random() > 0.005) {
      dataCollection4.push({id: i, nom: faker.name.lastName(), prenom: faker.name.firstName()});
    }
    i++;
  }

  console.log("1st parse");
  let res = ts.__loadData(dataCollection);
  assert.equal(ts.__dict.count(),dataCollection.length, `collection should have same size as dataCollection: ${dataCollection.length}`);

  console.log("2nd parse");
  res = ts.__loadData(dataCollection2);
  assert.equal(ts.__dict.count(),dataCollection2.length, `collection should have same size as dataCollection2: ${dataCollection2.length}`);


  console.log("3rd parse");
  res = ts.__loadData(dataCollection3);
  assert.equal(ts.__dict.count(),dataCollection3.length, `collection should have same size as dataCollection3: ${dataCollection3.length}`);

  console.log("4th parse");
  res = ts.__loadData(dataCollection4, true);
  assert.equal(ts.__dict.count(),dataCollection3.length, `parse with merge : collection should have same size as dataCollection3: ${dataCollection3.length}`);
});


QUnit.test("Test constant actions", function( assert ) {
  let namespace = "k";
  let actions = {
    init:     'init',
    initOne:  'initOne',
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

  assert.ok(typeof k.actions === "object", "type of action should be an object");
  assert.equal(Object.keys(k.actions).length, Object.keys(actions).length, "actions and constants.actions should have the same size");

  for(let prop in k.actions) {
    assert.ok(actions.hasOwnProperty(prop), "actions and constants.actions should have the same property " + prop);
    assert.equal(k.actions[prop], namespace+"_"+actions[prop], "constants.action should have the right namespace");
    assert.equal(k.__dict.get(k.actions[prop]), prop, "the __dict should allow us to get the prop back from the namespaced action");
  }
});

QUnit.test("Test store private methods", function( assert ) {
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
  let ts = new BaseStore(tr, k, testDispatcher);


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"}
  ];

  let tableRecord = ts.__getCurrentTable();
  // test parse collection
  let res = ts.__loadData(dataCollection);

  assert.equal(ts.collection.count(),4, "collection should count 4 elts");
  assert.equal(ts.__getCurrentTable().__counter,4, "db __counter should equal 4 elts");

  let r1 = ts.get(1);
  let __cid = r1.get("__cid");

  // test __edit
  r1 = r1.set("a", "ijk");
  ts.__edit(r1);
  assert.ok(Immutable.is(ts.get(1), r1), "test elements after edition, elements should be equals (using Immutable.is)");

  //test __add
  let r5 = new tr({id: 5, a:"abc", b:"bcd"})
  r5 = ts.__add(r5);
  assert.equal(ts.collection.count(),5, "collection should count 5 elts");
  assert.equal(r5.__cid, "c4", "cid should be c4");
  assert.ok(r5.id);

  // test __remove
  let r2 = ts.get(2);
  ts.__remove(r2);
  let __cid2 = r2.get("__cid");
  assert.notOk(ts.__dict.has("2"), "After remove, __dict should not index element any more");
  assert.notOk(ts.__collection.has(__cid2), "After remove, record with __cid: "+__cid2+" should not be present in __collection");
  assert.equal(ts.__getCurrentTable().__counter,5, "db __counter should equal 5 elts");
});


QUnit.test("Test refresh collection and merge", function( assert ) {

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
  let ts = new BaseStore(tr, k, testDispatcher);


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"}
  ];

  // test parse collection with loadData
  console.warn("first collection parsing");
  ts.__loadData(dataCollection);
  assert.equal(ts.getAll().count(),4, "collection should count 4 elts");

  let dataCollectionModified = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abcd", b:"bcd"}
  ];

  console.warn("second collection parsing");
  ts.__loadData(dataCollectionModified);

  console.log("col", ts.__collection.toJS());
  assert.equal(ts.getAll().count(),4, "collection should count 4 elts");


  // test parse collection with loadDiffData
  dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"}
  ];

  console.warn("first collection parsing");
  ts.__loadData(dataCollection);
  assert.equal(ts.getAll().count(),4, "collection should count 4 elts");
});


QUnit.test("Test CRUD", function( assert ) {
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
  let ts = new BaseStore(tr, k, testDispatcher);

  let r1 = new tr({id: 1, a:"aaa", b:"bbb"});
  let r2 = new tr({id: 2, a:"bbb", b:"ccc"});
  let r3 = new tr({id: 3, a:"ccc", b:"ddd"});
  let r4 = new tr({id: 4, a:"abc", b:"bcd"});

  //console.log(r1.get("__cid"));
  assert.notOk(r1.get("__cid"), "__cid should be null when record is created");

  ts.create({record: r1});
  ts.create({record: r2});
  ts.create({record: r3});
  ts.create({record: r4});

  console.log("__col", ts.getAll().toJS());
  console.log("__dict", ts.__dict.toJS());
  console.log("record created", ts.get(1).toJS());

  assert.equal(ts.getAll().count(),4, "Collection should have 4 elt");
  assert.ok(ts.get(1).get("__cid"), "elements should have a __cid set");

  let _r1 = ts.get(1);
  assert.ok(Immutable.is(ts.getByCid(_r1.get("__cid")), _r1), "test get by cid");

  let _r2 = ts.get(2);
  ts.delete({record: _r2});

  assert.notOk(ts.get(2));
  assert.notOk(ts.__dict.get(2));
  assert.equal(ts.getAll().count(), 3, "should rest 3 elts in collection");
});

QUnit.test("Test filter collections", function( assert ) {
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

  let TestStore = BaseStore.compose([SelectableStore, FilterableStore, SortableStore, ToggleableStore]);

  let ts = new TestStore(tr, k, testDispatcher);
  ts.triggerSearchAt = 0;


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__loadData(dataCollection);

  ts.filter({criterion: "b", keys: ["a"]});
  assert.equal(ts.getFiltered().count(),2, "filtered collection should count 2 elts");
  assert.equal(ts.__collection.count(),4, "getAll should have all values");
  ts.filter({criterion: "b", keys: ["a", "b"]})
  assert.equal(ts.getFiltered().count(),3, "filtered collection should count 3 elts");
  ts.filter({criterion: "d", keys: ["a", "b"]})
  assert.equal(ts.getFiltered().count(),2, "filtered collection should count 2 elts");
  ts.filter({criterion: "bc", keys: ["a", "b"]})
  assert.equal(ts.getFiltered().count(),1, "filtered collection should count 1 elts");
  ts.resetFilter();
  assert.equal(ts.getFiltered().count(),4, "filtered collection should match collection");
});


QUnit.test("Test sort collections", function( assert ) {
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

  let TestStore = BaseStore.compose([SelectableStore, FilterableStore, SortableStore, ToggleableStore]);

  let ts = new TestStore(tr, k, testDispatcher);

  ts.triggerSearchAt = 0;


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__loadData(dataCollection);
  assert.equal(ts.getSorted().first().get("id"),1, "first item of sorted collection should be 1");
  assert.equal(ts.getSorted().last().get("id"),4, "last item of sorted collection should be 4");

  ts.reverse();
  assert.equal(ts.getSorted().first().get("id"),4, "first item of sorted collection should be 4");
  assert.equal(ts.getSorted().last().get("id"),1, "last item of sorted collection should be 1");

  ts.sort({keys:["a"]});
  assert.equal(ts.getSorted().first().get("id"),1, "first item of sorted collection should be 1");
  assert.equal(ts.getSorted().last().get("id"),3, "last item of sorted collection should be 3");
});


QUnit.test("Test toggleable collections", function( assert ) {
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
  let tr = Record({id: null, a:1, b:2, enabled: false});

  let TestStore = BaseStore.compose([SelectableStore, FilterableStore, SortableStore, ToggleableStore]);

  let ts = new TestStore(tr, k, testDispatcher);

  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__loadData(dataCollection);

  let r1 = ts.get(1);
  ts.toggle({record: r1});
  r1 = ts.get(1);
  assert.ok(r1.get("enabled"));

});


QUnit.test("Test selectable collections", function( assert ) {
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
  let tr = Record({id: null, a:1, b:2, enabled: false});


  let TestStore = BaseStore.compose([SelectableStore, FilterableStore, SortableStore]);

  let ts = new TestStore(tr, k, testDispatcher);

  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__loadData(dataCollection);

  ts.select({record: ts.get(1)});
  assert.ok(ts.isSelected(ts.get(1)));

  ts.select({record: ts.get(3)});
  assert.equal(ts.getSelection().count(), 2);

  ts.deselect({record: ts.get(3)});
  assert.notOk(ts.isSelected(ts.get(3)));
  assert.equal(ts.getSelection().count(), 1);

  ts.deselectAll();
  assert.equal(ts.getSelection().count(), 0);
  ts.selectAll();
  assert.equal(ts.getSelection().count(), 4);
});


QUnit.test("Test multiples behaviors", function( assert ) {
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
  let tr = Record({id: null, a:1, b:2, enabled: false});

  let TestStore = BaseStore.compose([SelectableStore, FilterableStore, SortableStore]);

  let ts = new TestStore(tr, k, testDispatcher);

  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__loadData(dataCollection);

  ts.select({record: ts.get(1)});
  assert.ok(ts.isSelected(ts.get(1)));

  ts.select({record: ts.get(3)});
  assert.equal(ts.getSelection().count(), 2);

  ts.deselect({record: ts.get(3)});
  assert.notOk(ts.isSelected(ts.get(3)));
  assert.equal(ts.getSelection().count(), 1);

  assert.ok(ts.getFiltered().count() == ts.getAll().count(), "filtered collection should have same size as collection");

  // with sortable behavior, __collection should resolve to __collection__
  ts.__collection = Immutable.Map();
  assert.ok(ts.getAll().count() == 0, "with sortable behavior, collection should resolve to __collection");
  assert.ok(ts.getFiltered().count() == 0, "with sortable behavior, getFiltered should resolve to __collection");
});



// QUnit.test("Promises test", function( assert ) {
//   console.log("promises !!");

//   let p = Promise.resolve("coucou");

//   p.then(function() {
//     console.log("promises !!");
//     return Promise.reject(new Error("error"));
//     //throw new Error("error");
//   })
//   //.catch(function(error){ console.log("promise error", error); })
//   .then(function() {
//     return Promise.resolve();
//   }).catch(function(error){ console.log("promise error", error); })
//   assert.ok(true);
// });

