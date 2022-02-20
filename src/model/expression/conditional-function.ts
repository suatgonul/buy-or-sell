import {Candle} from '../candle';
import {Function} from './function';
import {Expression} from './expression';

export interface ConditionalFunction extends Function, Expression {
  evaluate(candleIndex: number, candles: Candle[]): boolean;
}