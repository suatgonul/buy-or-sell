import {Candle} from '../model/candle';
import {Value} from '../model/expression/value';
import {DataRef, SingleValue} from '../model/expression/single-value';
import {RuntimeException} from '@nestjs/core/errors/exceptions/runtime.exception';
import {Expression} from '../model/expression/expression';
import {NumericFunction} from '../model/expression/numeric-function';
import {AssociationOperator, ExpressionGroup} from '../model/expression/expression-group';
import {ConditionalFunction} from '../model/expression/conditional-function';

export class ValueEvaluator {
  evaluateValue(value: Value, candleIndex: number, candles: Candle[]): number {
    if (value instanceof SingleValue) {
      return this.evaluateSingleValue(value, candleIndex, candles);
    } else {
      return (value as NumericFunction).evaluate(candleIndex, candles);
    }
  }

  private evaluateSingleValue(value: SingleValue, candleIndex: number, candles: Candle[]): number {
    if (value.constantValue) {
      return value.constantValue;
    } else if (value.dataRef) {
      return this.resolveDataRef(value.dataRef, candleIndex, candles);
    }
    throw new RuntimeException("No valid single value");
  }

  private resolveDataRef(dataRef: DataRef, candleIndex: number, candles: Candle[]): number {
    const candle: Candle = candles[candleIndex];
    switch (dataRef) {
      case DataRef.O:
        return candle.open;
      case DataRef.H:
        return candle.high;
      case DataRef.L:
        return candle.low;
      case DataRef.C:
        return candle.close;
    }
    throw new RuntimeException('Illegal data ref');
  }

  public evaluateExpression(expression: Expression, candleIndex: number, candles: Candle[]): boolean {
    if (expression instanceof ExpressionGroup) {
      const expressionResults: boolean[] = expression.expressions.map(innerExpression => this.evaluateExpression(innerExpression, candleIndex, candles));
      if (expression.operator === AssociationOperator.AND) {
        return expressionResults.every(result => result);
      } else {
        return expressionResults.some(result => result);
      }

    } else {
      return (expression as ConditionalFunction).evaluate(candleIndex, candles);
    }
  }

}