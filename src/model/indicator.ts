import {Signal} from './signal';
import {DateTime} from 'luxon';
import {Expression} from './expression/expression';
import {Value} from './expression/value';
import {ValueFactory} from './expression/value-factory';
import {ExpressionFactory} from './expression/expression-factory';

export class Indicator {
  metrics: Value[];
  buyRules: Expression[];
  sellRules: Expression[];
  category: IndicatorCategory;

  constructor(data: any) {
    this.metrics = data.metrics.map(metric => ValueFactory.createValue(metric));
    this.buyRules = data.buyRules.map(rule => ExpressionFactory.createExpression(rule));
    this.sellRules = data.sellRules.map(rule => ExpressionFactory.createExpression(rule));
    this.category = data.category;
  }

  calculateMetrics(timestamp: DateTime): Promise<Signal> {
    return null;
  }

  async generateSignal(timestamp: DateTime): Promise<Signal> {
    await this.calculateMetrics(timestamp);

    /*const buy: boolean = await this.runBuyRules();
    if (!buy) {
      const sell: boolean = await this.runSellRules();
      if (sell) {
        return Signal.SELL;
      } else {
        return Signal.NEUTRAL;
      }
    } else {
      return Signal.BUY;
    }*/
    return Promise.resolve(Signal.NEUTRAL);
  }
}

export enum IndicatorName {
  MOVING_AVERAGE = 'movingAverage'
}

export enum IndicatorCategory {

}