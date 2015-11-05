"use strict";

import Immutable from "immutable";

Immutable.Record.constructor.prototype.fromJS = function(values) {
  var that = this;
  var nested = Immutable.fromJS(values, function(key, value){
    if(that.prototype[key] && that.prototype[key].constructor.prototype instanceof Immutable.Record){ return that.prototype[key].constructor.fromJS(value) }
    else { return value }
  })
  return this(nested);
}

Immutable.Record.prototype.toJSON = function() {
  let toStringify = this.toJS();
  delete toStringify["__cid"];
  return toStringify;
}

let Record = function(defaultValues, name) {
  return Immutable.Record(Object.assign({__cid: null}, defaultValues), name);
}

module.exports = Record;
