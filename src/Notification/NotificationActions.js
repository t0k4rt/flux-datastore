"use strict";
import { NotificationRecord, levels } from './NotificationRecord';

class NotificationActions {
  constructor(_constants, _dispatcher) {
    this.constants = _constants;
    this.dispatcher = _dispatcher;
  }

  log(_level, _message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: _level, message:_message, context: _context})
    })
  }

  debug(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.DEBUG, message:_message, context: _context})
    })
  }

  info(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.INFO, message:_message, context: _context})
    })
  }

  notice(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.NOTICE, message:_message, context: _context})
    })
  }

  warning(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.WARNING, message:_message, context: _context})
    })
  }

  error(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.ERROR, message:_message, context: _context})
    })
  }

  critical(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.CRITICAL, message:_message, context: _context})
    })
  }

  emergency(_message, _context = {}) {
    this.dispatcher.dispatch({
      type: this.constants.actions.create,
      record: new NotificationRecord({level: levels.EMERGENCY, message:_message, context: _context})
    })
  }

  delete(_record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.delete,
      record: _record
    })
  }

  dismissAll() {
    this.dispatcher.dispatch({
      type: this.constants.actions.dismissAll,
    })
  }

  dismiss(record) {
    this.dispatcher.dispatch({
      type: this.constants.actions.dismiss,
      record: record
    })
  }
}

export default NotificationActions
