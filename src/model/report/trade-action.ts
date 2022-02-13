import {Signal} from '../signal';
import {DateTime} from 'luxon';

export class TradeAction {
  constructor(public signal: Signal,
              public timestamp: DateTime) {
  }
}