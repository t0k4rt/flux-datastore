"use strict";

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_immutable2.default.Record.constructor.prototype.fromJS = function (values) {
  var that = this;
  var nested = _immutable2.default.fromJS(values, function (key, value) {
    if (that.prototype[key] && that.prototype[key].constructor.prototype instanceof _immutable2.default.Record) {
      return that.prototype[key].constructor.fromJS(value);
    } else {
      return value;
    }
  });
  return this(nested);
};

_immutable2.default.Record.prototype.toJSON = function () {
  var toStringify = this.toJS();
  delete toStringify["__cid"];
  return toStringify;
};

_immutable2.default.Record.prototype.toJSONWithPrefix = function (prefix) {
  var toStringify = this.toJS();

  for (var k in toStringify) {
    if (prefix != "") {
      toStringify[prefix + "." + k] = toStringify[k];
      delete toStringify[k];
    }
  }

  delete toStringify["__cid"];
  return toStringify;
};

var Record = function Record(defaultValues, name) {
  return _immutable2.default.Record(Object.assign({ __cid: null }, defaultValues), name);
};

module.exports = Record;
