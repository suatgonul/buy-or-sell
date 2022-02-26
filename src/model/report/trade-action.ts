import {Signal} from '../signal';
import {DateTime} from 'luxon';

export class TradeAction {
  /**
   *
   * @param signal
   * @param timestamp
   * @param price Price used in the action
   * @param fiatAmount
   * @param instrumentAmount
   */
  constructor(public signal: Signal,
              public timestamp: DateTime,
              public price: number,
              public fiatAmount: number,
              public instrumentAmount: number) {
  }
}