"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectableStore = undefined;

var _BaseStore2 = require("../BaseStore");

var _BaseStore3 = _interopRequireDefault(_BaseStore2);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SelectableStore = exports.SelectableStore = function SelectableStore(ComposedStore) {
  return (function (_BaseStore) {
    _inherits(_class, _BaseStore);

    function _class(record, constants, __dispatcher, sync) {
      _classCallCheck(this, _class);

      // select

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, record, constants, __dispatcher, sync));

      _this.events = Object.assign(_this.events, { select: 'select' });
      _this.__selection = _immutable2.default.Map();
      return _this;
    }

    _createClass(_class, [{
      key: "getSelection",
      value: function getSelection() {
        return this.__selection;
      }
    }, {
      key: "isSelected",
      value: function isSelected(record) {
        return this.__selection.has(record.__cid);
      }
    }, {
      key: "initSelection",
      value: function initSelection() {
        var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var context = _ref.context;
        var params = _ref.params;

        // the params should be used to filter data through api calls
        if (this.__sync) {
          return this.__sync.context(context).fetchAll(params).then((function (result) {
            result.forEach(function (elt) {
              if (elt.hasOwnProperty(this.idMap)) {

                var record = this.get(elt[this.idMap]);
                if (record) {
                  this.select(record);
                }
              }
            });
            return Promise.resolve(this.__loadData(result));
          }).bind(this));
        }
      }
    }, {
      key: "deselectAll",
      value: function deselectAll() {
        this.__selection = this.__selection.clear();
        this.emit("select");
      }
    }, {
      key: "selectAll",
      value: function selectAll() {
        this.__selection = this.__collection;
        this.emit("select");
      }
    }, {
      key: "select",
      value: function select(_ref2) {
        var record = _ref2.record;

        if (record && record.__cid && !this.__selection.has(record.__cid)) {
          this.__selection = this.__selection.set(record.__cid, record);
          this.emit("select");
        } else {
          console.error("Record exists");
        }
      }
    }, {
      key: "deselect",
      value: function deselect(_ref3) {
        var record = _ref3.record;

        if (record.__cid && this.__selection.has(record.__cid)) {
          this.__selection = this.__selection.delete(record.__cid);
          this.emit("select");
        } else {
          console.error("Could not find record");
        }
      }
    }]);

    return _class;
  })(_BaseStore3.default);
};