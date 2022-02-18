import {BaseFunction} from './base-function';
import {Value} from '../model/expression/value';
import {Candle} from '../model/candle';
import {ValueEvaluator} from '../strategy-runner/value-evaluator';

export class MovingAverage extends BaseFunction {

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
    const evaluatedValues: number[] = [];
    for(let i: number = this.windowLength, j: number = candleIndex; i > 0; i--, j--) {
      evaluatedValues.push(valueEvaluator.evaluateValue(this.value, j, candles, metrics));
    }

    const windowSum: number = evaluatedValues.reduce(((previousValue, currentValue) => previousValue + currentValue), 0);
    return windowSum / this.windowLength;
  }
}