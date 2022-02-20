import {Injectable} from '@nestjs/common';
import {DateTime, Duration} from 'luxon';
import {Candle} from '../model/candle';
import {TimescaleDbService} from './db/timescaledb/timescale-db.service';
import {Strategy} from '../model/strategy';
import {Indicator} from '../model/indicator';
import {Symbol} from '../model/symbol';
import {subtractDuration} from '../util/date-time-utils';
import {Expression} from '../model/expression/expression';
import {ExpressionGroup} from '../model/expression/expression-group';
import {ConditionalFunction} from '../model/expression/conditional-function';

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
    const windowLength: number = indicator.buyRules.concat(indicator.sellRules)
    .map(rule => this.getWindowLengthForExpression(rule))
    .reduce((previousValue, currentValue) => Math.max(previousValue, currentValue));
    return windowLength;
  }

  private getWindowLengthForExpression(expression: Expression): number {
    if (expression instanceof ExpressionGroup) {
      const windowLengthsForBranches: number[] = expression.expressions.map(innerExpression => {
        return this.getWindowLengthForExpression(innerExpression);
      })
      return windowLengthsForBranches.reduce((previousValue, currentValue) => Math.max(previousValue, currentValue));

    } else {
      return (expression as ConditionalFunction).getWindowLength();
    }
  }
}