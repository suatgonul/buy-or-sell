import {Value} from '../../model/expression/value';
import {Candle} from '../../model/candle';
import {ValueEvaluator} from '../../strategy-runner/value-evaluator';
import {NumericFunction} from '../../model/expression/numeric-function';
import {BaseFunction} from '../base-function';
import {SMA} from 'technicalindicators';

export class MovingAverage extends BaseFunction implements NumericFunction {

  constructor(public value: Value, protected windowLength: number) {
    super(windowLength);
  }

  getWindowLength(): number {
    const windowLength: number = this.windowLength - 1; //-1 as the range is inclusive
    return windowLength + this.getValueWindowLength(this.value);
  }

  evaluate(candleIndex: number, candles: Candle[]): number {
    if (this.windowLength - 1 > candleIndex) {
      return NaN;
    }

    const valueEvaluator: ValueEvaluator = new ValueEvaluator();
    const evaluatedValues: number[] = [];
    for(let i: number = this.windowLength, j: number = candleIndex; i > 0; i--, j--) {
      evaluatedValues.push(valueEvaluator.evaluateValue(this.value, j, candles));
    }

    const average: number[] = SMA.calculate({period: this.windowLength, values: evaluatedValues});
    return average[0];
    // const windowSum: number = evaluatedValues.reduce(((previousValue, currentValue) => previousValue + currentValue), 0);
    // return windowSum / this.windowLength;
  }
}