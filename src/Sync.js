"use strict";

import baseJQuery from "jquery";
import assign from "object-assign";
import template from "lodash.template";
import { ErrorActions, ErrorRecord } from "./Error/Error";

class Sync {

  constructor(jquery, baseUrl, options) {
    let _options = options || {};

    this.__baseUrl = baseUrl;
    this.__jquery = (jquery) ? jquery : baseJQuery;
    this.__context = {};

    this.__routes = {
      'fetchAll': '',
      'fetch': '${id}',
      'create': '',
      'update': '${id}',
      'delete': '${id}'
    };

    if(_options.routes) {
      this.__routes = assign(this.__routes, _options.routes);
    }
  }

  context(_context) {
    this.__context = _context || {};
    return this;
  }

  fetchAll() {
    let resolveFn = function(resolve, reject) {
      this.__jquery.ajax({
        url: this.__generateUrl('fetchAll'),
        dataType: 'json',
        method: 'GET',
        cache: false
      })
      .fail(function(xhr, textStatus, err) {
        let errMsg = JSON.parse(xhr.responseText);
        reject({statusCode: xhr.status, message: errMsg});
        })
      .done(function(data) {
        resolve(data);
      });
    };

    return new Promise(resolveFn.bind(this));
  }

  fetch(id) {
    let resolveFn = function(resolve, reject) {
      this.__jquery.ajax({
        url: this.__generateUrl('fetch', { id: id }),
        dataType: 'json',
        method: 'GET',
        cache: false
      })
      .fail(function(xhr, textStatus, err) {
        let errMsg = JSON.parse(xhr.responseText);
        reject({statusCode: xhr.status, message: errMsg});
        })
      .done(function(data) {
        resolve(data);
      });
    };

    return new Promise(resolveFn.bind(this));
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
      record = record.withMutations(function(_record) {
        for(let prop in data) {
          if(_record.has(prop) && data.hasOwnProperty(prop)) {
            _record.set(prop, data[prop]);
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
    try {
      let errMsg = JSON.parse(xhr.responseText);
      ErrorActions.create(new ErrorRecord({ message: errMsg.message}));
    } catch(e) {
      ErrorActions.create(new ErrorRecord({ message: "An unknown error occured"}));
    }
  }

  __generateUrl(method, params) {
    let _params = params || {};
    let _context = this.__context;
    let _compiled = template(this.__routes[method]);

    if(_params.id) {
      _context = assign(_context, { id: _params.id });
    }

    return this.__baseUrl + _compiled(_context);
  }
}

export default Sync
