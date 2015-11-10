"use strict";

import baseJQuery from "jquery";
import assign from "object-assign";
import template from "lodash.template";
import ErrorAction from "./Error/ErrorActions";

class Sync {

  constructor(jquery, baseUrl, options) {
    let _options = options || {};

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

    if(_options.routes) {
      this.__routes = assign(this.__routes, _options.routes);
    }
  }

  context(_context) {
    this.__context = _context;
    return this;
  }

  fetchAll(success) {
    return this.__jquery.ajax({
      url: this.__generateUrl('fetchAll'),
      dataType: 'json',
      method: 'GET',
      cache: false
    })
    .fail(this.__syncError)
    .done(function(data) {
      success(data);
    });
  }

  fetch(id, success) {
    return this.__jquery.ajax({
      url: this.__generateUrl('fetch', { id: id }),
      dataType: 'json',
      method: 'GET',
      cache: false
    })
    .fail(this.__syncError)
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
    })
    .fail(this.__syncError)
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
      url: this.__generateUrl('update', { id: record.get('id') }),
      dataType: 'json',
      method: 'PUT',
      data: record
    })
    .fail(this.__syncError)
    .done(function() {
      success(record);
    });
  }

  delete(record, success) {
    return this.__jquery.ajax({
      url: this.__generateUrl('delete', { id: record.get('id') }),
      dataType: 'json',
      method: 'DELETE'
    })
    .fail(this.__syncError)
    .done(function() {
      success(record);
    });
  }

  __syncError(xhr, textStatus, err) {
    let errMsg = JSON.parse(xhr.responseText);
    ErrorAction.add(new Error(errMsg.message, xhrstatus));
  }

  __generateUrl(method, params) {
    let _params = params || {};
    let _context = this.__context;
    let _compiled = template(this.__routes[method]);

    if(_params.id) {
      let id = _params.id;
    }

    return this.__baseUrl + _compiled(_context);
  }
}

export default Sync
