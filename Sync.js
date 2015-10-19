import { Ajax } from "jquery";
import ErrorAction from "./ErrorAction"
import uri from "urijs"

class Sync {

  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  fetchAll(success) {
    return $.ajax({
      url: this.baseUrl,
      dataType: 'json',
      method: 'GET',
      cache: false
    }).fail(this.__syncError)
    .done(function(data) {
      success(data);
    });
  }

  fetch(id, success) {
    return $.ajax({
      url: this.baseUrl+"/"+id,
      dataType: 'json',
      method: 'GET',
      cache: false
    }).fail(this.__syncError)
    .done(function(data) {
      success(data);
    });
  }

  create(record, success) {
    return $.ajax({
      url: this.baseUrl,
      dataType: 'json',
      method: 'POST',
      data: record
    }).fail(this.__syncError)
    .done(function(_data) {
      let data = _data;
      // merge data from rest api
      record = record.withMutations(function() {
        for(let prop in data) {
          if(record.has(prop) && data.hasOwnProperty(prop)) {
            record.set("prop", data[prop]);
          }
        }
      });
      success(record);
    });
  }

  update(record, success){
    return $.ajax({
      url: this.baseUrl+"/"+record.get("id"),
      dataType: 'json',
      method: 'PUT',
      data: record
    }).fail(this.__syncError)
    .done(function() {
      success(record);
    });
  }

  delete(record, success) {
    return $.ajax({
      url: this.baseUrl+"/"+record.get("id"),
      dataType: 'json',
      method: 'DELETE'
    }).fail(this.__syncError)
    .done(function() {
      success(record);
    });
  }

  __syncError(xhr, status, err) {
    let errorMessage = JSON.parse(xhr.responseText);
    ErrorAction.add(new Error(errorMessage.message, status));
  }
}
