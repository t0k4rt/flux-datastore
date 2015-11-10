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

//import ErrorAction from "./Error/ErrorActions";

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
      return this.__jquery.ajax({
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
        record = record.withMutations(function (_record) {
          for (var prop in data) {
            if (_record.has(prop) && data.hasOwnProperty(prop)) {
              _record.set("prop", data[prop]);
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
        url: this.__generateUrl('update', { id: record.get('id') }),
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
        url: this.__generateUrl('delete', { id: record.get('id') }),
        dataType: 'json',
        method: 'DELETE'
      }).fail(this.__syncError).done(function () {
        success(record);
      });
    }
  }, {
    key: "__syncError",
    value: function __syncError(xhr, textStatus, err) {
      var errMsg = JSON.parse(xhr.responseText);
      //ErrorAction.add(new Error(errMsg.message, xhrstatus));
    }
  }, {
    key: "__generateUrl",
    value: function __generateUrl(method, params) {
      var _params = params || {};
      var _context = this.__context;
      var _compiled = (0, _lodash2.default)(this.__routes[method]);

      if (_params.id) {
        _context = (0, _objectAssign2.default)(_context, { id: _params.id });
      }

      return this.__baseUrl + _compiled(_context);
    }
  }]);

  return Sync;
})();

exports.default = Sync;