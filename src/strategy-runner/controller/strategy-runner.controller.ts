import {Body, Controller, Get, Post, Query} from '@nestjs/common';
import {Symbol} from '../../model/symbol';
import {DateTime, Duration} from 'luxon';
import {StrategyRunnerService} from '../strategy-runner.service';
import {TestReport} from '../../model/report/test-report';
import {Strategy} from '../../model/strategy';

@Controller('test')
export class StrategyRunnerController {
  constructor(private testRunnerService: StrategyRunnerService) {
  }

  @Post()
  async populateOhlcData(@Body() strategy: string,
                         @Query('symbol') symbol: string,
                         @Query('duration') duration: string,
                         @Query('startTime') startTime: string,
                         @Query('endTime') endTime: string): Promise<TestReport> {

    const _strategy: Strategy = new Strategy(strategy);
    const _symbol: Symbol = Symbol.fromSymbolName(symbol);
    const _duration: Duration = Duration.fromISO(duration);

    return this.testRunnerService.runStrategy(_strategy, _symbol, _duration, startTime, endTime);
  }
}
