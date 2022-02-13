/**
 * Candle data for a symbol
 */
import {Indicator} from './indicator';
import {Expression} from './expression/expression';

export class Strategy {
  indicators: Indicator[]
  /*public buyRules: Expression[],
              public sellRules: Expression[],
              public takeProfitRules: Expression[],
              public stopLossRules: Expression[]*/

  constructor(data: any) {
    this.indicators = data.indicators.map(indicator => new Indicator(indicator));
  }
}