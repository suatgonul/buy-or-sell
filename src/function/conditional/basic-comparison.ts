import {BaseFunction} from '../base-function';
import {Value} from '../../model/expression/value';
import {Candle} from '../../model/candle';
import {ValueEvaluator} from '../../strategy-runner/value-evaluator';
import {ConditionalFunction} from '../../model/expression/conditional-function';

export class BasicComparison extends BaseFunction implements ConditionalFunction {

  constructor(public operator: string, public firstValue: Value, public secondValue: Value) {
    super();
  }

  getWindowLength(): number {
    return Math.max(this.getValueWindowLength(this.firstValue), this.getValueWindowLength(this.secondValue));
  }

  evaluate(candleIndex: number, candles: Candle[]): boolean {
    const valueEvaluator: ValueEvaluator = new ValueEvaluator();
    const firstValue: number = valueEvaluator.evaluateValue(this.firstValue, candleIndex, candles);
    const secondValue: number = valueEvaluator.evaluateValue(this.secondValue, candleIndex, candles);
    switch (this.operator) {
      case '>':
        return firstValue > secondValue;
      case '>=':
        return firstValue >= secondValue;
      case '<':
        return firstValue < secondValue;
      case '<=':
        return firstValue >= secondValue;
    }
  }
}