import {Signal} from './signal';
import {DateTime} from 'luxon';
import {Expression} from './expression/expression';
import {ExpressionFactory} from './expression/expression-factory';
import {Candle} from './candle';
import {ValueEvaluator} from '../strategy-runner/value-evaluator';

export class Indicator {
  buyRules: Expression[];
  sellRules: Expression[];
  category: IndicatorCategory;

  constructor(data: any) {
    this.buyRules = data.buyRules.map(rule => ExpressionFactory.createExpression(rule));
    this.sellRules = data.sellRules.map(rule => ExpressionFactory.createExpression(rule));
    this.category = data.category;
  }

  async generateSignal(timestamp: DateTime, candles: Candle[]): Promise<Signal> {
    let ruleResults: boolean[] = this.runRules(this.buyRules, timestamp, candles);
    const buy: boolean = this.shouldBuy(ruleResults);
    if (!buy) {
      ruleResults = await this.runRules(this.sellRules, timestamp, candles);
      const sell: boolean = this.shouldSell(ruleResults);
      if (sell) {
        return Signal.SELL;
      } else {
        return Signal.NEUTRAL;
      }
    } else {
      return Signal.BUY;
    }
    return Promise.resolve(Signal.NEUTRAL);
  }

  private runRules(rules: Expression[], timestamp: DateTime, candles: Candle[]): boolean[] {
    const valueEvaluator: ValueEvaluator = new ValueEvaluator();
    const candleIndex: number = candles.findIndex(candle => candle.timestamp.equals(timestamp));
    return rules.map(rule => valueEvaluator.evaluateExpression(rule, candleIndex, candles));
  }

  private shouldBuy(ruleResponses: boolean[]): boolean {
    // for now, buy only if all rules are met
    return ruleResponses.length > 0 && ruleResponses.every(response => response);
  }

  private shouldSell(ruleResponses: boolean[]): boolean {
    // for now, sell only if all rules are met
    return ruleResponses.length > 0 && ruleResponses.every(response => response);
  }
}

export enum IndicatorName {
  MOVING_AVERAGE = 'movingAverage'
}

export enum IndicatorCategory {

}