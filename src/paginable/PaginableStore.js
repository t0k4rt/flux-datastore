"use strict";
import BaseStore from "../BaseStore";

export let PaginableStore = ComposedStore => class extends ComposedStore {

  constructor(record, constants, __dispatcher, sync) {
    super(record, constants, __dispatcher, sync);

    this.events = Object.assign(this.events, {paginate: "paginate"});

    // is paginable flag
    this.isPaginable = true;

    // internal page state
    this.__cursor = 1;
    this.__totalPages = 1;
    this.__itemsPerPage = 50;

    // refresh pagination parameters on internal changes
    this.addListener("__reset", this.__resetPaginable);
    this.addListener(this.events.change, this.__refreshPaginable);
    if(this.isFilterable) {
      this.addListener(this.events.filter, this.__refreshPaginable);
    }
  }

  __resetPaginable() {
    this.__cursor = 1;
    this.__totalPages = Math.floor((this.collection.count()-1)/this.__itemsPerPage) + 1;
  }

  __refreshPaginable() {
    this.__totalPages = Math.floor((this.collection.count()-1)/this.__itemsPerPage) + 1;
    if(this.__cursor > this.__totalPages) {
      this.__cursor = this.__totalPages;
      this.emit(this.events.paginate);
    }
  }

  __paginate(__collection) {
    return __collection.slice((this.__cursor-1)*this.__itemsPerPage, this.__cursor*this.__itemsPerPage);
  }

  __paginatePromise(__collection) {
    return Promise.Resolve(this.__paginate(__collection));
  }

  getPage() {
    return this.__paginate(this.__collection);
  }

  next() {
    if(this.__cursor < this.__totalPages) {
      ++this.__cursor;
    }
    this.emit(this.events.paginate);
  }

  prev() {
    if(this.__cursor > 1) {
      --this.__cursor;
    }
    this.emit(this.events.paginate);
  }

  first() {
    this.__cursor =  1;
    this.emit(this.events.paginate);
  }

  last() {
    this.__cursor = this.__totalPages;
    this.emit(this.events.paginate);
  }

  goto({pageNumber} = {}) {
    if(pagenumber > this.__totalPages || pagenumber < 1) {
      console.warning("Page out of bounds.");
    } else {
      this.__cursor = pageNumber;
      this.emit(this.events.paginate);
    }
  }

};
