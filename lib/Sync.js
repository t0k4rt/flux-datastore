"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jquery = require("jquery");

var _jquery2 = _interopRequireDefault(_jquery);

var _objectAssign = require("object-assign");

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import ErrorAction from "./Error/ErrorActions"

var Sync = (function () {
  function Sync(jquery, baseUrl, options) {
    _classCallCheck(this, Sync);

    this.__baseUrl = baseUrl;
    this.__jquery = jquery ? jquery : _jquery2.default;
    this.__context = {};

    this.__routes = {
      'fetchAll': '',
      'fetch': '/${id}',
      'create': '',
      'update': '/${id}',
      'delete': '/${id}'
    };

    if (options.routes) {
      this.__routes = (0, _objectAssign2.default)(this.__routes, options.routes);
    }
  }

  _createClass(Sync, [{
    key: "addContext",
    value: function addContext(_context) {
      this.__context = _context;
      return this;
    }
  }, {
    key: "fetchAll",
    value: function fetchAll(success) {
      return this.__jquery.ajax({
        url: this.__generateUrl('fetchAll'),
        dataType: 'json',
        method: 'GET',
        cache: false
      }).fail(this.__syncError).done(function (data) {
        success(data);
      });
    }
  }, {
    key: "fetch",
    value: function fetch(id, success) {
      return $.ajax({
        url: this.__generateUrl('fetch', { id: id }),
        dataType: 'json',
        method: 'GET',
        cache: false
      }).fail(this.__syncError).done(function (data) {
        success(data);
      });
    }
  }, {
    key: "create",
    value: function create(record, success) {
      return this.__jquery.ajax({
        url: this.__generateUrl('create'),
        dataType: 'json',
        method: 'POST',
        data: record
      }).fail(this.__syncError).done(function (_data) {
        var data = _data;
        // merge data from rest api
        record = record.withMutations(function () {
          for (var prop in data) {
            if (record.has(prop) && data.hasOwnProperty(prop)) {
              record.set("prop", data[prop]);
            }
          }
        });
        success(record);
      });
    }
  }, {
    key: "update",
    value: function update(record, success) {
      return this.__jquery.ajax({
        url: this.__generateUrl('update', { record: record }),
        dataType: 'json',
        method: 'PUT',
        data: record
      }).fail(this.__syncError).done(function () {
        success(record);
      });
    }
  }, {
    key: "delete",
    value: function _delete(record, success) {
      return this.__jquery.ajax({
        url: this.__generateUrl('delete', { record: record }),
        dataType: 'json',
        method: 'DELETE'
      }).fail(this.__syncError).done(function () {
        success(record);
      });
    }
  }, {
    key: "__syncError",
    value: function __syncError(err) {
      //let errorMessage = JSON.parse(xhr.responseText);
      //ErrorAction.add(new Error(errorMessage.message, status));
    }
  }, {
    key: "__generateUrl",
    value: function __generateUrl(method, params) {

      var context = this.__context;

      if (params.id) {
        var id = params.id;
      }

      if (params.record) {
        var id = record.get("id");
      }

      return this.baseUrl + this.__routes[method];
    }
  }]);

  return Sync;
})();

exports.default = Sync;