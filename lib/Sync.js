"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _objectAssign = require("object-assign");

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _lodash = require("lodash.template");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sync = (function () {
  function Sync(jquery, baseUrl, options) {
    _classCallCheck(this, Sync);

    var _options = options || {};

    this.__baseUrl = baseUrl;
    this.__jquery = jquery ? jquery : _jquery2.default;
    this.__context = {};

    this.__routes = {
      'fetchAll': '',
      'fetch': '${id}',
      'create': '',
      'update': '${id}',
      'delete': '${id}'
    };

    if (_options.routes) {
      this.__routes = (0, _objectAssign2.default)(this.__routes, _options.routes);
    }
  }

  _createClass(Sync, [{
    key: "context",
    value: function context(_context) {
      this.__context = _context || {};
      return this;
    }
  }, {
    key: "__getErrorMessage",
    value: function __getErrorMessage(xhr) {
      try {
        var errorResponse = JSON.parse(xhr.responseText);
        return { statusCode: xhr.status, message: errorResponse.message, title: errorResponse.title, raw: errorResponse };
      } catch (e) {
        return { statusCode: xhr.status, message: "An unknown error occured" };
      }
    }
  }, {
    key: "http",
    value: function http(_method, _url, _data) {
      //todo : add data;
      var resolveFn = function resolveFn(resolve, reject) {
        this.__jquery.ajax({
          url: _url,
          dataType: 'json',
          method: _method,
          cache: false
        }).fail((function (xhr, textStatus, err) {
          reject(this.__getErrorMessage(xhr));
        }).bind(this)).done(function (data) {
          resolve(data);
        });
      };
      return new Promise(resolveFn.bind(this));
    }
  }, {
    key: "fetchAll",
    value: function fetchAll() {
      var queryParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var _context = this.__context;
      this.__context = {};
      var url = this.__generateUrl("fetchAll", _context, queryParams);
      return this.http("GET", url);
    }
  }, {
    key: "fetch",
    value: function fetch(id) {
      var queryParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _context = this.__context;
      this.__context = {};
      var url = this.__generateUrl("fetch", (0, _objectAssign2.default)({ id: id }, _context), queryParams);
      return this.http("GET", url);
    }
  }, {
    key: "create",
    value: function create(record) {
      var _context = this.__context;
      this.__context = {};
      var resolveFn = function resolveFn(resolve, reject) {
        this.__jquery.ajax({
          url: this.__generateUrl('create', {}, _context),
          dataType: 'json',
          method: 'POST',
          data: record
        }).fail((function (xhr, textStatus, err) {
          reject(this.__getErrorMessage(xhr));
        }).bind(this)).done(function (_data) {
          var data = _data;
          // merge data from rest api
          record = record.withMutations(function (_record) {
            for (var prop in data) {
              if (_record.has(prop) && data.hasOwnProperty(prop)) {
                _record.set(prop, data[prop]);
              }
            }
          });
          resolve(record);
        });
      };
      return new Promise(resolveFn.bind(this));
    }
  }, {
    key: "update",
    value: function update(record) {
      var _context = this.__context;
      this.__context = {};

      var resolveFn = function resolveFn(resolve, reject) {
        this.__jquery.ajax({
          url: this.__generateUrl('update', { id: record.get('id') }, _context),
          dataType: 'json',
          method: 'PUT',
          data: record
        }).fail((function (xhr, textStatus, err) {
          reject(this.__getErrorMessage(xhr));
        }).bind(this)).done(function () {
          resolve(record);
        });
      };
      return new Promise(resolveFn.bind(this));
    }
  }, {
    key: "delete",
    value: function _delete(record) {
      var _context = this.__context;
      this.__context = {};
      var url = this.__generateUrl("fetch", (0, _objectAssign2.default)({ id: record.get('id') }, _context), queryParams);
      return this.http("DELETE", url);
    }
  }, {
    key: "__generateQueryString",
    value: function __generateQueryString(params) {
      var qs = [];
      for (var key in params) {
        if (params.hasOwnProperty(key)) {
          qs.push(key + "=" + params[key]);
        }
      }
      if (qs.length > 0) {
        return "?" + qs.join("&");
      } else {
        return "";
      }
    }
  }, {
    key: "__generateUrl",
    value: function __generateUrl(_routeName) {
      var _routeParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _queryParams = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _compiled = (0, _lodash2.default)(this.__routes[_routeName]);
      return this.__baseUrl + _compiled(_routeParams) + this.__generateQueryString(_queryParams);
    }
  }]);

  return Sync;
})();

exports.default = Sync;