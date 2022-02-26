import {Injectable} from '@nestjs/common';
import {Strategy} from '../model/strategy';
import {DateTime, Duration} from 'luxon';
import {TimescaleDbService} from '../data-manager/db/timescaledb/timescale-db.service';
import {Symbol} from '../model/symbol';
import {Candle} from '../model/candle';
import {Signal} from '../model/signal';
import {TestReport} from '../model/report/test-report';
import {Position} from '../model/report/position';
import {DataCollectorService} from '../data-manager/data-collector.service';
import {TradeAction} from '../model/report/trade-action';

@Injectable()
export class StrategyRunnerService {
  constructor(private timescaleDbService: TimescaleDbService, private dataCollectorService: DataCollectorService) {
  }

  async runStrategy(strategy: Strategy, symbol: Symbol, duration: Duration, startTime: string, endTime: string): Promise<TestReport> {
    const candles: Candle[] = await this.dataCollectorService.collectData(strategy, symbol, duration, startTime, endTime);
    const report: TestReport = new TestReport(new Position(symbol));
    const _startTime: DateTime = DateTime.fromISO(startTime);
    const candleIndex: number = candles.findIndex(candle => candle.timestamp.equals(_startTime));

    for (let i = candleIndex; i < candles.length; i++) {
      const candle: Candle = candles[i];
      // first obtain indicator signals
      const signals: Signal[] = strategy.indicators.map(indicator => {
        return indicator.generateSignal(candle.timestamp, candles);
      });

      // TODO apply stop-loss, take-profit rules

      const action: Signal = this.harmonizeSignals(signals)

      if (action !== Signal.NEUTRAL) {
        this.applyAction(action, candle, report.position);
      }
    }

    return Promise.resolve(report);
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