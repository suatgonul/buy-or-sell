import {Candle} from '../candle';
import {Function} from './function';
import {Value} from './value';

export interface NumericFunction extends Function, Value {
  evaluate(candleIndex: number, candles: Candle[]): number;
}