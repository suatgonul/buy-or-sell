import {Signal} from './signal';
import {DateTime} from 'luxon';
import {Expression} from './expression/expression';
import {Value} from './expression/value';
import {ValueFactory} from './expression/value-factory';
import {ExpressionFactory} from './expression/expression-factory';
import {Candle} from './candle';
import {ValueEvaluator} from '../strategy-runner/value-evaluator';

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

  calculateMetrics(timestamp: DateTime, candles: Candle[]): Map<string, number> {
    const valueEvaluator: ValueEvaluator = new ValueEvaluator();
    const candleIndex: number = candles.findIndex(candle => candle.timestamp.equals(timestamp));
    const metricValues: Map<string, number> = new Map<string, number>();
    this.metrics.forEach(metric => {
      metricValues.set(metric.id, valueEvaluator.evaluateValue(metric, candleIndex, candles, metricValues));
    });
    return metricValues;
  }

  async generateSignal(timestamp: DateTime, candles: Candle[]): Promise<Signal> {
    await this.calculateMetrics(timestamp, candles);

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