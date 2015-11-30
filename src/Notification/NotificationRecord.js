"use strict";
import Record from '../Record';


let levels = {
  EMERGENCY : 'emergency';
  ALERT     : 'alert';
  CRITICAL  : 'critical';
  ERROR     : 'error';
  WARNING   : 'warning';
  NOTICE    : 'notice';
  INFO      : 'info';
  DEBUG     : 'debug';
}

let NotificationRecord = new Record({level: levels.DEBUG, message: null, context: {}, ttl: 4000 });

export { NotificationRecord, levels };
export default NotificationRecord;
