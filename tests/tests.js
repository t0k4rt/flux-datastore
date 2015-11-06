"use strict;"
import Immutable from "immutable";
import { Dispatcher } from "flux";

import DataStore, {Record, Constants, SimpleStore, Actions} from "../src/DataStore";

let testDispatcher = new Dispatcher();

QUnit.test("Test constant actions", function( assert ) {
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

  assert.ok(typeof k.actions === "object", "type of action should be an object");
  assert.equal(Object.keys(k.actions).length, Object.keys(actions).length, "actions and constants.actions should have the same size");

  for(let prop in k.actions) {
    assert.ok(actions.hasOwnProperty(prop), "actions and constants.actions should have the same property " + prop);
    assert.equal(k.actions[prop], namespace+actions[prop], "constants.action should have the right namespace");
    assert.equal(k.__dict.get(k.actions[prop]), prop, "the __dict should allow us to get the prop back from the namespaced action");
  }
});

QUnit.test("Test parse collections", function( assert ) {
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


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"}
  ];
  ts.__parseCollection(dataCollection);
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
  let ts = new SimpleStore(tr, k, testDispatcher);

  let r1 = new tr({id: 1, a:"aaa", b:"bbb"});
  let r2 = new tr({id: 2, a:"bbb", b:"ccc"});
  let r3 = new tr({id: 3, a:"ccc", b:"ddd"});
  let r4 = new tr({id: 4, a:"abc", b:"bcd"});

  //console.log(r1.get("__cid"));
  assert.notOk(r1.get("__cid"), "__cid should be null when reocrd is created");

  ts.create({record: r1});
  ts.create({record: r2});
  ts.create({record: r3});
  ts.create({record: r4});

  console.log("col", ts.getAll().toJS());
  console.log("col", ts.__dict.toJS());
  console.log("record created", ts.get(1).toJS());



  assert.equal(ts.getAll().count(),4, "Collection should have 4 elt");
  assert.ok(ts.get(1).get("__cid"), "elements should have a __cid set");

  let _r1 = ts.get(1);
  assert.ok(Immutable.is(ts.__getByCid(_r1.get("__cid")), _r1), "test get by cid");

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
  let ts = new SimpleStore(tr, k, testDispatcher);
  ts.triggerSearchAt = 0;


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__parseCollection(dataCollection);
  ts.filter({criterion: "b", keys: ["a"]})
  assert.equal(ts.getFiltered().count(),2, "filtered collection should count 2 elts");
  ts.filter({criterion: "b", keys: ["a", "b"]})
  assert.equal(ts.getFiltered().count(),3, "filtered collection should count 3 elts");
  ts.filter({criterion: "d", keys: ["a", "b"]})
  assert.equal(ts.getFiltered().count(),2, "filtered collection should count 2 elts");
  ts.filter({criterion: "bc", keys: ["a", "b"]})
  assert.equal(ts.getFiltered().count(),1, "filtered collection should count 1 elts");

  ts.resetFilter()
  assert.ok(ts.getFiltered() === undefined, "filtered collection should be undefined");
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
  let ts = new SimpleStore(tr, k, testDispatcher);
  ts.triggerSearchAt = 0;


  let dataCollection = [
    {id: 1, a:"aaa", b:"bbb"},
    {id: 2, a:"bbb", b:"ccc"},
    {id: 3, a:"ccc", b:"ddd"},
    {id: 4, a:"abc", b:"bcd"},
  ];
  ts.__parseCollection(dataCollection);
  ts.sort({});
  assert.equal(ts.getAll().first().get("id"),1, "first item of sorted collection should be 1");
  assert.equal(ts.getAll().last().get("id"),4, "last item of sorted collection should be 4");

  ts.reverse();
  assert.equal(ts.getAll().first().get("id"),4, "first item of sorted collection should be 4");
  assert.equal(ts.getAll().last().get("id"),1, "last item of sorted collection should be 1");

  ts.sort({keys:["a"]});
  assert.equal(ts.getAll().first().get("id"),1, "first item of sorted collection should be 1");
  assert.equal(ts.getAll().last().get("id"),3, "last item of sorted collection should be 3");
});




