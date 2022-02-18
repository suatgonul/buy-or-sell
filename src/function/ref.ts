import {BaseFunction} from './base-function';
import {Value} from '../model/expression/value';
import {Candle} from '../model/candle';
import {ValueEvaluator} from '../strategy-runner/value-evaluator';

export class Ref extends BaseFunction {

  constructor(public value: Value, public windowLength: number) {
    super();
  }

  getWindowLength(): number {
    return this.windowLength;
  }

  evaluate(candleIndex: number, candles: Candle[], metrics: Map<string, number>): number {
    if (this.windowLength - 1 > candleIndex) {
      return NaN;
    }

    const valueEvaluator: ValueEvaluator = new ValueEvaluator();
    return valueEvaluator.evaluateValue(this.value, candleIndex - this.windowLength, candles, metrics);
  }
}