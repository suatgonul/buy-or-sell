import {TradeAction} from './trade-action';
import {Symbol} from '../symbol';

export class Position {
  instrumentAmount: number = 0;
  initialFiatAmount: number = 100000;
  fiatAmount: number;
  actions: TradeAction[] = [];

  constructor(public symbol: Symbol) {
    this.fiatAmount = this.initialFiatAmount;
  }
}