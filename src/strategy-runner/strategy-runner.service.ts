import {Injectable} from '@nestjs/common';
import {Strategy} from '../model/strategy';
import {DateTime, Duration} from 'luxon';
import {TimescaleDbService} from '../data-manager/db/timescaledb/timescale-db.service';
import {Symbol} from '../model/symbol';
import {Candle} from '../model/candle';
import {Signal} from '../model/signal';
import {TestReport} from '../model/report/test-report';
import {DataCollectorService} from '../data-manager/data-collector.service';
import {TradeAction} from '../model/report/trade-action';
import {Position} from '../model/report/position';
import {last} from '../util/array-utils';

@Injectable()
export class StrategyRunnerService {
  constructor(private timescaleDbService: TimescaleDbService, private dataCollectorService: DataCollectorService) {
  }

  /**
   * Runs the strategy and produces a test report. It either runs the test in 2 ways:
   * 1) By starting from the start time on sequential chunks that have a length of specified range
   * 2) By selecting chunks that have a random start time and a length of the specified range
   *
   * @param strategy strategy to be tested
   * @param symbol symbol to be tested
   * @param duration duration of the symbol
   * @param startTime start time for the test. For random ranges, the start time refers the earliest time that a chunk can have
   * @param endTime end time for the test
   * @param range duration of each chunk
   * @param iteration number of iteration for random chunk sampling
   */
  async runStrategy(strategy: Strategy, symbol: Symbol, duration: Duration, startTime: string, endTime: string,
                    range: Duration, iteration: number): Promise<TestReport> {

    let testPositions: Promise<Position>[] = [];
    const _startTime: DateTime = DateTime.fromISO(startTime);
    const _endTime: DateTime = DateTime.fromISO(endTime);

    // if no iteration is specified, apply the strategy on sequential chunks starting from the start time
    if (!iteration) {
      let chunkStartTime = DateTime.fromISO(startTime);
      let chunkEndTime: DateTime = DateTime.fromISO(startTime).plus(range).minus(Duration.fromMillis(1000));
      while (chunkEndTime < _endTime) {
        testPositions.push(this.runStrategyBetweenDates(strategy, symbol, duration, chunkStartTime, chunkEndTime));
        chunkStartTime = chunkStartTime.plus(range);
        chunkEndTime = chunkStartTime.plus(range).minus(Duration.fromMillis(1000));
      }
    }
    // if an iteration is provided start times are chosen randomly
    else {
      let iterationStartTime: DateTime;
      let iterationEndTime: DateTime;
      for (let i = 1; i <= iteration; i++) {
        iterationStartTime = this.getRandomStartTime(_startTime, _endTime, range, duration);
        iterationEndTime = iterationStartTime.plus(range).minus(Duration.fromMillis(1000));
        testPositions.push(this.runStrategyBetweenDates(strategy, symbol, duration, iterationStartTime, iterationEndTime));
      }
    }

    return Promise.all(testPositions).then(positions => {
      const overallPerformance: number = this.calculatePerformance(positions);
      return new TestReport(positions, overallPerformance);
    });
  }

  private calculatePerformance(positions: Position[]): number {
    const performances: number[] = positions
    .filter(position => position.actions.length > 0)
    .map(position => {
      const lastAction: TradeAction = last(position.actions);
      const finalFiatAmount: number = position.fiatAmount + lastAction.price * lastAction.instrumentAmount;
      return finalFiatAmount / position.initialFiatAmount * 100;
    })
    const performancesTotal = performances.reduce((aggregated, current) => {
      return aggregated + current;
    }, 0);
    return performancesTotal / performances.length;
  }

  private getRandomStartTime(startTime: DateTime, endTime: DateTime, range: Duration, duration: Duration): DateTime {
    const startOffset: number = Math.floor(Math.random() * (endTime.toMillis() - startTime.toMillis() - range.toMillis()) / duration.toMillis());
    return DateTime.fromMillis(startOffset * duration.toMillis() + startTime.toMillis());
  }

  async runStrategyBetweenDates(strategy: Strategy, symbol: Symbol, duration: Duration, startTime: DateTime, endTime:DateTime): Promise<Position> {

    const candles: Candle[] = await this.dataCollectorService.collectData(strategy, symbol, duration, startTime.toUTC().toISO(), endTime.toUTC().toISO());
    const position: Position = new Position(symbol);
    const candleIndex: number = candles.findIndex(candle => candle.timestamp.equals(startTime));

    for (let i = candleIndex; i < candles.length; i++) {
      const candle: Candle = candles[i];
      // first obtain indicator signals
      const signals: Signal[] = strategy.indicators.map(indicator => {
        return indicator.generateSignal(candle.timestamp, candles);
      });

      // TODO apply stop-loss, take-profit rules

      const action: Signal = this.harmonizeSignals(signals)

      if (action !== Signal.NEUTRAL) {
        this.applyAction(action, candle, position);
      }
    }

    return Promise.resolve(position);
  }

  private harmonizeSignals(indicatorSignals: Signal[]): Signal {
    let action: Signal = Signal.NEUTRAL;
    // for now, if there is at least one buy signal, apply buy action.
    // TODO: In the future, there should be a better way of combining all indicator signals
    if (indicatorSignals.some(signal => signal === Signal.BUY)) {
      action = Signal.BUY;
    } else if (indicatorSignals.some(signal => signal === Signal.SELL)) {
      action = Signal.SELL;
    }

    return action;
  }

  private applyAction(action: Signal, candle: Candle, position: Position): void {
    // TODO apply buying strategy rules
    const appliedAction: TradeAction = this.updatePosition(action, candle, position, 100);
    if (appliedAction) {
      position.actions.push(appliedAction);
    }
  }

  /**
   * Uses the all fiat to buy the instrument or sell all instrument
   * @param action
   * @param candle
   * @param position
   * @param balanceRatio Amount of the available balance in percentage to be used for in trade action
   * @private
   */
  private updatePosition(action: Signal, candle: Candle, position: Position, balanceRatio: number): TradeAction {
    let appliedAction: TradeAction = null;
    if (action === Signal.BUY) {
      if (position.fiatAmount !== 0) {
        const amountToBuy: number = position.fiatAmount * balanceRatio / 100 / candle.close;
        position.fiatAmount = 0;
        position.instrumentAmount = amountToBuy;
        appliedAction = new TradeAction(action, candle.timestamp, candle.close, position.fiatAmount, position.instrumentAmount);
      }

    } else if (action === Signal.SELL) {
      if (position.instrumentAmount !== 0) {
        const soldValue: number = candle.close * position.instrumentAmount * balanceRatio / 100;
        position.instrumentAmount = 0;
        position.fiatAmount = soldValue;
        appliedAction = new TradeAction(action, candle.timestamp, candle.close, position.fiatAmount, position.instrumentAmount);
      }
    }
    return appliedAction;
  }
}