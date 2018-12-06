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
  }

  __resetPaginable() {
    this.__cursor = 1;
    let countCollection = this.__collection ? this.__collection.count() : 0;
    this.__totalPages = Math.floor((countCollection-1)/this.__itemsPerPage) + 1;
  }

  __refreshPaginable(__collection) {
    let countCollection = __collection ? __collection.count() : 0;
    this.__totalPages = Math.floor((countCollection-1)/this.__itemsPerPage) + 1;
    if(this.__cursor > this.__totalPages) {
      this.__cursor = 1;
    }
  }

  __paginate(__collection) {
    this.__refreshPaginable(__collection);
    return __collection.slice((this.__cursor-1)*this.__itemsPerPage, this.__cursor*this.__itemsPerPage);
  }

  __paginatePromise(__collection) {
    return Promise.Resolve(this.__paginate(__collection));
  }

  setItemsPerPage({itemsPerPage}) {
    if(itemsPerPage != this.__itemsPerPage) {
      this.__itemsPerPage = itemsPerPage;
      this.emit(this.events.paginate);
    }
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
    if(pageNumber > this.__totalPages || pageNumber < 1) {
      console.warning("Page out of bounds.");
    } else {
      this.__cursor = pageNumber;
      this.emit(this.events.paginate);
    }
  }

};
