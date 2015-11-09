"use strict";

import baseJQuery from "jquery";
import assign from "object-assign";
//import ErrorAction from "./Error/ErrorActions"

class Sync {

  constructor(jquery, baseUrl, options) {
    this.__baseUrl = baseUrl;
    this.__jquery = (jquery) ? jquery : baseJQuery;
    this.__context = {};

    this.__routes = {
      'fetchAll': '',
      'fetch': '/${id}',
      'create': '',
      'update': '/${id}',
      'delete': '/${id}'
    };

    if(options.routes) {
      this.__routes = assign(this.__routes, options.routes);
    }
  }

  addContext(_context) {
    this.__context = _context;
    return this;
  }

  fetchAll(success) {
    return this.__jquery.ajax({
      url: this.__generateUrl('fetchAll'),
      dataType: 'json',
      method: 'GET',
      cache: false
    }).fail(this.__syncError)
    .done(function(data) {
      success(data);
    });
  }

  fetch(id, success) {
    return $.ajax({
      url: this.__generateUrl('fetch', { id: id }),
      dataType: 'json',
      method: 'GET',
      cache: false
    }).fail(this.__syncError)
    .done(function(data) {
      success(data);
    });
  }

  create(record, success) {
    return this.__jquery.ajax({
      url: this.__generateUrl('create'),
      dataType: 'json',
      method: 'POST',
      data: record
    }).fail(this.__syncError)
    .done(function(_data) {
      let data = _data;
      // merge data from rest api
      record = record.withMutations(function() {
        for(let prop in data) {
          if(record.has(prop) && data.hasOwnProperty(prop)) {
            record.set("prop", data[prop]);
          }
        }
      });
      success(record);
    });
  }

  update(record, success){
    return this.__jquery.ajax({
      url: this.__generateUrl('update', { record: record }),
      dataType: 'json',
      method: 'PUT',
      data: record
    }).fail(this.__syncError)
    .done(function() {
      success(record);
    });
  }

  delete(record, success) {
    return this.__jquery.ajax({
      url: this.__generateUrl('delete', { record: record }),
      dataType: 'json',
      method: 'DELETE'
    }).fail(this.__syncError)
    .done(function() {
      success(record);
    });
  }

  __syncError(err) {
    //let errorMessage = JSON.parse(xhr.responseText);
    //ErrorAction.add(new Error(errorMessage.message, status));
  }

  __generateUrl(method, params) {

    let context = this.__context;

    if(params.id) {
      let id = params.id;
    }

    if(params.record) {
      let id = record.get("id");
    }

    return this.baseUrl + this.__routes[method];
  }
}

export default Sync
