import {Function} from '../model/expression/function';
import {Candle} from '../model/candle';

export abstract class BaseFunction implements Function {
  getWindowLength(): number {
    return 0;
  }

  abstract evaluate(candleIndex: number, candles: Candle[], metrics: Map<string, number>);
}