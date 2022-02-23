import {Injectable} from '@nestjs/common';
import {Strategy} from '../model/strategy';
import {DateTime, Duration} from 'luxon';
import {TimescaleDbService} from '../data-manager/db/timescaledb/timescale-db.service';
import {Symbol} from '../model/symbol';
import {Candle} from '../model/candle';
import {Signal} from '../model/signal';
import {TestReport} from '../model/report/test-report';
import {TradeAction} from '../model/report/trade-action';
import {DataCollectorService} from '../data-manager/data-collector.service';

@Injectable()
export class StrategyRunnerService {
  constructor(private timescaleDbService: TimescaleDbService, private dataCollectorService: DataCollectorService) {
  }

  async runStrategy(strategy: Strategy, symbol: Symbol, duration: Duration, startTime: string, endTime: string): Promise<TestReport> {
    const candles: Candle[] = await this.dataCollectorService.collectData(strategy, symbol, duration, startTime, endTime);
    const report: TestReport = new TestReport();
    const _startTime: DateTime = DateTime.fromISO(startTime);
    const candleIndex: number = candles.findIndex(candle => candle.timestamp.equals(_startTime));

    for (let i = candleIndex; i < candles.length; i++) {
      const candle: Candle = candles[i];
      // first obtain indicator signals
      const signals: Signal[] = strategy.indicators.map(indicator => {
        return indicator.generateSignal(candle.timestamp, candles);
      });

      let action: Signal = Signal.NEUTRAL;
      if (signals.some(signal => signal === Signal.BUY)) {
        action = Signal.BUY;
      } else if (signals.some(signal => signal === Signal.SELL)) {
        action = Signal.SELL;
      }

      // apply strategy rules
      this.applyStrategyRules(action, symbol, candle, report);
    }
    return Promise.resolve(null);
  }

  private applyStrategyRules(indicatorAction: Signal, symbol: Symbol, candle: Candle, report: TestReport): void {
    // TODO apply strategy rules
    this.recordAction(indicatorAction, symbol, candle, report);
  }

  private recordAction(selectedAction: Signal, symbol: Symbol, candle: Candle, report: TestReport): void {
    const currentPosition: Signal = this.getCurrentPosition(report);
    const actionTime: DateTime = candle.timestamp.plus(candle.duration);
    if (
      (selectedAction === Signal.BUY && currentPosition !== Signal.BUY) ||
      (selectedAction === Signal.SELL && currentPosition !== Signal.SELL)
    ) {

      const updatedBag: Map<string, number> = this.getUpdatedBag(selectedAction, symbol, candle.close, report);
      const action: TradeAction = new TradeAction(selectedAction, actionTime, updatedBag);
      report.actions.push(action);
    }
  }

  private getUpdatedBag(selectionAction: Signal, symbol: Symbol, price: number, testReport: TestReport): Map<string, number> {
    let fiatAmount: number = 100000;
    const lastAction: TradeAction = this.getLastAction(testReport);
    let bag: Map<string, number> = new Map<string, number>();
    if (lastAction) {
      bag = lastAction.bag;
      fiatAmount = bag.get(symbol.mainInstrument);
    } else {
      bag.set(symbol.mainInstrument, 0);
      bag.set(symbol.fiat, fiatAmount);
    }

    if (selectionAction === Signal.BUY) {
      const amountToBuy: number = fiatAmount / price;
      bag.set(symbol.mainInstrument, amountToBuy);
      bag.set(symbol.fiat, 0);

    } else if (selectionAction === Signal.SELL) {
      const soldValue: number = price * bag.get(symbol.mainInstrument);
      bag.set(symbol.mainInstrument, 0);
      bag.set(symbol.fiat, soldValue);
    }
    return bag;
  }

  private getCurrentPosition(testReport: TestReport): Signal {
    let lastAction: TradeAction = this.getLastAction(testReport);
    if (lastAction) {
      return lastAction.signal;
    } else {
      return Signal.NEUTRAL;
    }
  }

  private getLastAction(testReport: TestReport): TradeAction {
    let lastAction: TradeAction = null;
    if (testReport.actions?.length !== 0) {
      lastAction = testReport.actions[testReport.actions.length - 1];
    }
    return lastAction;
  }
}