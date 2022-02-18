import {Injectable} from '@nestjs/common';
import {DateTime, Duration} from 'luxon';
import {Candle} from '../model/candle';
import {TimescaleDbService} from './db/timescaledb/timescale-db.service';
import {Strategy} from '../model/strategy';
import {Indicator} from '../model/indicator';
import {Symbol} from '../model/symbol';
import {Function} from '../model/expression/function';
import {SingleValue} from '../model/expression/single-value';
import {OperatorValue} from '../model/expression/operator-value';
import {Value} from '../model/expression/value';
import {FunctionFactory} from '../function/function-factory';
import {subtractDuration} from '../util/date-time-utils';

@Injectable()
export class DataCollectorService {
  constructor(private timescaleDb: TimescaleDbService) {
  }

  async collectData(strategy: Strategy, symbol: Symbol, duration: Duration, startTime: string, endTime: string): Promise<Candle[]> {
    const windowLength: number = this.getWindowLengthForStrategy(strategy);
    const startTimeForStrategy: DateTime = subtractDuration(DateTime.fromISO(startTime), duration, windowLength);
    const candles: Candle[] = await this.timescaleDb.getCandles(symbol, duration, startTimeForStrategy.toUTC().toISO(), endTime);
    return candles;
  }

  private getWindowLengthForStrategy(strategy: Strategy): number {
    const windowLength = strategy.indicators
    .map(indicator => this.getWindowLengthForIndicator(indicator))
    .reduce((previousValue, currentValue) => Math.max(previousValue, currentValue));
    return windowLength;
  }

  private getWindowLengthForIndicator(indicator: Indicator): number {
    const windowLength: number = indicator.metrics
    .map(metric => this.getWindowLengthForValue(metric, 0))
    .reduce((previousValue, currentValue) => Math.max(previousValue, currentValue));
    return windowLength;
  }

  private getWindowLengthForValue(value: Value, windowLength: number): number {
    if (value instanceof SingleValue) {
      return windowLength;

    } else if (value instanceof OperatorValue) {
      const func: Function = FunctionFactory.convertValueToFunction(value);
      const lengthForCurrentFunc: number = func.getWindowLength();
      const windowLengthsForBranches: number[] = value.parameters.map(parameterValue => {
        return this.getWindowLengthForValue(parameterValue, lengthForCurrentFunc + windowLength);
      })
      return windowLengthsForBranches.reduce((previousValue, currentValue) => Math.max(previousValue, currentValue));
    }
  }
}