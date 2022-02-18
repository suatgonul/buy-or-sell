import {Candle} from '../model/candle';
import {Value} from '../model/expression/value';
import {DataRef, SingleValue} from '../model/expression/single-value';
import {OperatorValue} from '../model/expression/operator-value';
import {RuntimeException} from '@nestjs/core/errors/exceptions/runtime.exception';
import {FunctionFactory} from '../function/function-factory';
import {Function} from '../model/expression/function';

export class ValueEvaluator {
  evaluateValue(value: Value, candleIndex: number, candles: Candle[], metrics: Map<string, number>): number {
    if (value instanceof SingleValue) {
      return this.evaluateSingleValue(value, candleIndex, candles, metrics);
    } else if (value instanceof OperatorValue) {
      return this.evaluateOperatorValue(value, candleIndex, candles, metrics);
    }
    throw new RuntimeException('Invalid value');
  }

  private evaluateSingleValue(value: SingleValue, candleIndex: number, candles: Candle[], metrics: Map<string, number>): number {
    if (value.constantValue) {
      return value.constantValue;
    } else if (value.dataRef) {
      return this.resolveDataRef(value.dataRef, candleIndex, candles);
    } else if (value.metric) {
      return metrics.get(value.metric);
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

  private evaluateOperatorValue(value: OperatorValue, candleIndex: number, candles: Candle[], metrics: Map<string, number>): number {
    const func: Function = FunctionFactory.convertValueToFunction(value);
    return func.evaluate(candleIndex, candles, metrics);
  }
}