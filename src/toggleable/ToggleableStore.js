"use strict";
import BaseStore from "../BaseStore";

export let ToggleableStore = ComposedStore => class extends ComposedStore {

  toggle({record, context} = {}) {
    if(record.has("enabled")) {
      let _record = record.set("enabled", !record.get("enabled"));
      this.update({record: _record, context: context});
    } else {
      throw new Error(`Record with id ${record.id} does not have enabled property`);
    }
  }
};
