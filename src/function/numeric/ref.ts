import {Value} from '../../model/expression/value';
import {Candle} from '../../model/candle';
import {ValueEvaluator} from '../../strategy-runner/value-evaluator';
import {NumericFunction} from '../../model/expression/numeric-function';
import {BaseFunction} from '../base-function';

export class Ref extends BaseFunction implements NumericFunction {

  constructor(public value: Value, protected windowLength: number) {
    super(windowLength);
  }

  getWindowLength(): number {
    return this.windowLength + this.getValueWindowLength(this.value);
  }

  evaluate(candleIndex: number, candles: Candle[]): number {
    if (this.windowLength - 1 > candleIndex) {
      return NaN;
    }

    const valueEvaluator: ValueEvaluator = new ValueEvaluator();
    return valueEvaluator.evaluateValue(this.value, candleIndex - this.windowLength, candles);
  }
}