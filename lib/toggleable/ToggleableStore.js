"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToggleableStore = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BaseStore = require("../BaseStore");

var _BaseStore2 = _interopRequireDefault(_BaseStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ToggleableStore = exports.ToggleableStore = function ToggleableStore(ComposedStore) {
  return function (_ComposedStore) {
    _inherits(_class, _ComposedStore);

    function _class() {
      _classCallCheck(this, _class);

      return _possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).apply(this, arguments));
    }

    _createClass(_class, [{
      key: "toggle",
      value: function toggle() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            record = _ref.record,
            context = _ref.context;

        if (record.has("enabled")) {
          var _record = record.set("enabled", !record.get("enabled"));
          this.update({ record: _record, context: context });
        } else {
          throw new Error("Record with id " + record.id + " does not have enabled property");
        }
      }
    }]);

    return _class;
  }(ComposedStore);
};