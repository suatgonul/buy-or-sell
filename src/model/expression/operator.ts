import {Candle} from '../candle';

export interface Operator {
  evaluate(candleIndex: number, candles: Candle[], metrics: Map<string, number>)
}