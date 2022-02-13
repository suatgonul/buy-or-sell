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

    /*candles.map(candle => {
      // first obtain indicator signals
      const signalsToArrive: Promise<Signal>[] = strategy.indicators.map(indicator => {
        return indicator.generateSignal(candle.timestamp);
      });

      let action: Signal = Signal.NEUTRAL;
      Promise.all(signalsToArrive).then(signalArray => {
        if (signalArray.some(signal => signal === Signal.BUY)) {
          action = Signal.BUY;
        } else if (signalArray.some(signal => signal === Signal.SELL)) {
          action = Signal.SELL;
        }
      });

      // apply strategy rules
      this.applyStrategyRules(action, candle, report);
    });*/
    return Promise.resolve(null);
  }

  private applyStrategyRules(indicatorAction: Signal, candle: Candle, report: TestReport): void {
    // TODO apply strategy rules
    this.recordAction(indicatorAction, candle, report);
  }

  private recordAction(selectedAction: Signal, candle: Candle, report: TestReport): void {
    const currentPosition: Signal = this.getCurrentPosition(report);
    const actionTime: DateTime = candle.timestamp.plus(candle.duration);
    if (
      (selectedAction === Signal.BUY && currentPosition !== Signal.BUY) ||
      (currentPosition === Signal.SELL && currentPosition !== Signal.SELL)
    ) {
      const action: TradeAction = new TradeAction(selectedAction, actionTime);
      report.actions.push(action);
    }
  }

  private getCurrentPosition(testReport: TestReport): Signal {
    let lastAction: TradeAction = null;
    if (testReport.actions?.length !== 0) {
      lastAction = testReport.actions[testReport.actions.length - 1];
    }
    if (lastAction) {
      return lastAction.signal;
    } else {
      return Signal.NEUTRAL;
    }
  }
}