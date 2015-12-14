"use strict";

import baseJQuery from "jquery";
import assign from "object-assign";
import template from "lodash.template";

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

  __getErrorMessage(xhr) {
    try {
      let errorResponse = JSON.parse(xhr.responseText);
      return {statusCode: xhr.status, message: errorResponse.message, title: errorResponse.title, raw: errorResponse};
    } catch(e) {
      return {statusCode: xhr.status, message: "An unknown error occured"};
    }
  }

  http(_method, _url, _data) {
    //todo : add data;
    let resolveFn = function(resolve, reject) {
      this.__jquery.ajax({
        url: _url,
        dataType: 'json',
        method: _method,
        cache: false
      })
      .fail(function(xhr, textStatus, err) {
        reject(this.__getErrorMessage(xhr));
      }.bind(this))
      .done(function(data) {
        resolve(data);
      });
    };
    return new Promise(resolveFn.bind(this));
  }

  fetchAll(queryParams = {}) {
    let _context = this.__context;
    this.__context = {};
    let url = this.__generateUrl("fetchAll", _context, queryParams);
    return this.http("GET", url);
  }

  fetch(id, queryParams = {}) {
    let _context = this.__context;
    this.__context = {};
    let url = this.__generateUrl("fetch", assign({id: id},_context), queryParams);
    return this.http("GET", url);
  }

  create(record) {
    let _context = this.__context;
    this.__context = {};
    let resolveFn = function(resolve, reject) {
      this.__jquery.ajax({
        url: this.__generateUrl('create', {}, _context),
        dataType: 'json',
        method: 'POST',
        data: record
      })
      .fail(function(xhr, textStatus, err) {
        reject(this.__getErrorMessage(xhr));
      }.bind(this))
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
        resolve(record);
      });
    };
    return new Promise(resolveFn.bind(this));
  }

  update(record){
    let _context = this.__context;
    this.__context = {};

    let resolveFn = function(resolve, reject) {
      this.__jquery.ajax({
        url: this.__generateUrl('update', { id: record.get('id') }, _context),
        dataType: 'json',
        method: 'PUT',
        data: record
      })
      .fail(function(xhr, textStatus, err) {
        reject(this.__getErrorMessage(xhr));
      }.bind(this))
      .done(function() {
        resolve(record);
      });
    };
    return new Promise(resolveFn.bind(this));
  }

  delete(record) {
    let _context = this.__context;
    this.__context = {};
    let url = this.__generateUrl("fetch", assign({id: record.get('id')}, _context), queryParams);
    return this.http("DELETE", url);
  }

  __generateQueryString(params) {
    let qs = [];
    for(let key in params) {
      if(params.hasOwnProperty(key)) {
        qs.push(key+"="+params[key]);
      }
    }
    if(qs.length > 0) {
      return "?"+qs.join("&");
    }
    else {
      return "";
    }
  }

  __generateUrl(_route, _routeParams, _queryParams) {
    let _params = params || {};
    let _compiled = template(this.__routes[method]);

    return this.__baseUrl + _compiled(_routeParams) + this.__generateQueryString(_queryParams);
  }
}

export default Sync
