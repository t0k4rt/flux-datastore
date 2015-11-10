"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _events = require("events");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _defaultEvents = {
  change: 'change'
};

var _defaultSortFunction = function _defaultSortFunction(a, b) {
  var valueA = undefined,
      valueB = undefined;
  if (this.sortKeys.length > 0) {
    valueA = a.get(this.sortKeys[0]);
    valueB = b.get(this.sortKeys[0]);
  } else {
    valueA = a.get("__cid");
    valueB = b.get("__cid");
  }

  if (valueA === valueB) return 0;else return valueA > valueB ? 1 : -1;
};

var ErrorStore = (function (_EventEmitter) {
  _inherits(ErrorStore, _EventEmitter);

  function ErrorStore(record, constants, __dispatcher) {
    _classCallCheck(this, ErrorStore);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ErrorStore).call(this));

    _this.constants = constants;
    _this.record = record;

    // sort
    _this.sortKeys = ["__cid"];

    // overridable base variables
    _this.events = _defaultEvents;
    _this.sortFunction = _defaultSortFunction;

    // PRIVATE IMPORTANT !!!!!
    _this.__counter = 0;
    _this.__collection = _immutable2.default.Map();
    _this.__dispatcher = __dispatcher;
    _this.__dispatcher.register(_this.payloadHandler.bind(_this));
    _this.__dict = _immutable2.default.Map();
    return _this;
  }

  _createClass(ErrorStore, [{
    key: "__add",
    value: function __add(r) {
      // on check que l'élément accepte les __cid
      if (r.has("__cid")) {
        // cid must be empty / null
        if (!r.get("__cid")) {
          // compute ttl
          var ttl = undefined;
          if (this.__collection.count() > 1) {
            ttl = this.__collection.toList().last().get("ttl");
            ttl += 200;
          }

          // set cid from internal collection counter
          this.__counter = this.__counter + 1;
          r = r.set("__cid", "c" + this.__counter);
          if (ttl) {
            r = r.set("ttl", ttl);
          }
          // Set map with __cid and record
          this.__collection = this.__collection.set(r.get("__cid"), r);
          // add item to dict to be able to find it from id
          this.emit(this.events.change);
          window.setTimeout((function () {
            this.__remove(r);
          }).bind(this), r.get("ttl"));
        }
      } else {
        throw new Error("Model invalid, does not support __cid");
      }
    }
  }, {
    key: "__remove",
    value: function __remove(r) {
      var cid = r.get("__cid");
      var id = r.get("id");
      this.__collection = this.__collection.remove(cid);
      this.emit(this.events.change);
    }
  }, {
    key: "getAll",
    value: function getAll() {
      return this.__collection.sort(this.sortFunction.bind(this));
    }
  }, {
    key: "create",
    value: function create(_ref) {
      var record = _ref.record;

      this.__add(record);
    }
  }, {
    key: "delete",
    value: function _delete(_ref2) {
      var record = _ref2.record;

      if (record.get("__cid")) {
        this.__remove(record);
      } else {
        throw new Error("Cannot remove this record from collection, no __cid.");
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.__collection = _immutable2.default.Map();
      this.emit(this.events.change);
    }

    /**********************/
    /** listener section **/
    /**********************/

  }, {
    key: "listenTo",
    value: function listenTo(eventName, callback) {
      this.on(eventName, callback);
    }
  }, {
    key: "stopListeningTo",
    value: function stopListeningTo(eventName, callback) {
      this.removeListener(eventName, callback);
    }
  }, {
    key: "listenToChanges",
    value: function listenToChanges(callback) {
      this.listenTo(this.events.change, callback);
    }
  }, {
    key: "stopListeningToChanges",
    value: function stopListeningToChanges(callback) {
      this.stopListeningTo(this.events.change, callback);
    }

    /**************************/
    /** action proxy handler **/
    /**************************/

  }, {
    key: "payloadHandler",
    value: function payloadHandler(payload) {
      // get fn name from payload type
      var fn = this.constants.__dict.get(payload.type);

      // check if fn exists for current class
      if (fn && Reflect.has(this, fn)) {
        fn = Reflect.get(this, fn);
        Reflect.apply(fn, this, [payload]);
      } else {
        console.error('no function found to handle ' + fn);
      }
    }
  }]);

  return ErrorStore;
})(_events.EventEmitter);

exports.default = ErrorStore;