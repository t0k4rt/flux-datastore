"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Actions = (function () {
  function Actions(_constants, _dispatcher) {
    _classCallCheck(this, Actions);

    this.__constants = _constants;
    this.__dispatcher = _dispatcher;
    this.__waitFor = Immutable.Map();
  }

  _createClass(Actions, [{
    key: "create",
    value: function create(_record, _context) {
      this.__dispatcher.dispatch({
        namespace: this.__constants.namespace,
        type: this.__constants.actions.create,
        record: _record,
        context: _context || {}
      });
    }
  }, {
    key: "update",
    value: function update(_record, _context) {
      this.__dispatcher.dispatch({
        namespace: this.__constants.namespace,
        type: this.__constants.actions.update,
        record: _record,
        context: _context || {}
      });
    }
  }, {
    key: "delete",
    value: function _delete(_record, _context) {
      this.__dispatcher.dispatch({
        namespace: this.__constants.namespace,
        type: this.__constants.actions.delete,
        record: _record,
        context: _context || {}
      });
    }

    // experimental

  }, {
    key: "waitForWrapper",
    value: function waitForWrapper(fn) {
      return (function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        // if we have to wait for something
        if (this.__waitFor.count() > 0) {
          // we register a callback function
          this.dispatcher.register(function (payload) {
            if (this.__waitFor.has(payload.type)) {
              // we get the token from the payload
              var token = this.__waitFor.get(payload.type);
              // we wait for the token
              this.__dispatcher.waitFor([token]);
              // we clean the waitFor
              this.__waitFor = this.__waitFor.delete(payload.type);
              // when the waitfor is empty, we can call the function
              if (this.__waitFor.count() == 0) {
                fn.apply(undefined, args).bind(this);
              }
            }
          });
        } else {
          fn.apply(undefined, args).bind(this);
        }
      }).bind(this);
    }
  }, {
    key: "waitFor",
    value: function waitFor(store, action) {
      this.__waitFor = this.__waitFor.set(store.__dispatchToken, store.conastants.getTypeFromAction(action));
      return this;
    }
  }]);

  return Actions;
})();

Actions.compose = function (behaviors) {
  if (!Array.isArray(behaviors)) {
    throw new Error("behaviors must be an array");
  }
  return behaviors.reduce(function (a, b) {
    return b(a);
  }, Actions);
};

exports.default = Actions;