"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PaginableStore = undefined;

var _BaseStore = require("../BaseStore");

var _BaseStore2 = _interopRequireDefault(_BaseStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PaginableStore = exports.PaginableStore = function PaginableStore(ComposedStore) {
  return (function (_ComposedStore) {
    _inherits(_class, _ComposedStore);

    function _class(record, constants, __dispatcher, sync) {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, record, constants, __dispatcher, sync));

      _this.events = Object.assign(_this.events, { paginate: "paginate" });

      // is paginable flag
      _this.isPaginable = true;

      // internal page state
      _this.__cursor = 1;
      _this.__totalPages = 1;
      _this.__itemsPerPage = 50;

      // refresh pagination parameters on internal changes
      _this.addListener("__reset", _this.__resetPaginable);
      return _this;
    }

    _createClass(_class, [{
      key: "__resetPaginable",
      value: function __resetPaginable() {
        this.__cursor = 1;
        this.__totalPages = Math.floor((this.collection.count() - 1) / this.__itemsPerPage) + 1;
      }
    }, {
      key: "__refreshPaginable",
      value: function __refreshPaginable(__collection) {
        this.__totalPages = Math.floor((__collection.count() - 1) / this.__itemsPerPage) + 1;
        if (this.__cursor > this.__totalPages) {
          this.__cursor = 1;
        }
      }
    }, {
      key: "__paginate",
      value: function __paginate(__collection) {
        this.__refreshPaginable(__collection);
        return __collection.slice((this.__cursor - 1) * this.__itemsPerPage, this.__cursor * this.__itemsPerPage);
      }
    }, {
      key: "__paginatePromise",
      value: function __paginatePromise(__collection) {
        return Promise.Resolve(this.__paginate(__collection));
      }
    }, {
      key: "setItemsPerPage",
      value: function setItemsPerPage(_ref) {
        var itemsPerPage = _ref.itemsPerPage;

        if (itemsPerPage != this.__itemsPerPage) {
          this.__itemsPerPage = itemsPerPage;
          this.emit(this.events.paginate);
        }
      }
    }, {
      key: "getPage",
      value: function getPage() {
        return this.__paginate(this.__collection);
      }
    }, {
      key: "next",
      value: function next() {
        if (this.__cursor < this.__totalPages) {
          ++this.__cursor;
        }
        this.emit(this.events.paginate);
      }
    }, {
      key: "prev",
      value: function prev() {
        if (this.__cursor > 1) {
          --this.__cursor;
        }
        this.emit(this.events.paginate);
      }
    }, {
      key: "first",
      value: function first() {
        this.__cursor = 1;
        this.emit(this.events.paginate);
      }
    }, {
      key: "last",
      value: function last() {
        this.__cursor = this.__totalPages;
        this.emit(this.events.paginate);
      }
    }, {
      key: "goto",
      value: function goto() {
        var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var pageNumber = _ref2.pageNumber;

        if (pagenumber > this.__totalPages || pagenumber < 1) {
          console.warning("Page out of bounds.");
        } else {
          this.__cursor = pageNumber;
          this.emit(this.events.paginate);
        }
      }
    }]);

    return _class;
  })(ComposedStore);
};