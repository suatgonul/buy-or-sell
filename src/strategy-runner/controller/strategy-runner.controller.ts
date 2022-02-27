import {Body, Controller, Post, Query} from '@nestjs/common';
import {Symbol} from '../../model/symbol';
import {Duration} from 'luxon';
import {StrategyRunnerService} from '../strategy-runner.service';
import {TestReport} from '../../model/report/test-report';
import {Strategy} from '../../model/strategy';

@Controller('test')
export class StrategyRunnerController {
  constructor(private testRunnerService: StrategyRunnerService) {
  }

  @Post()
  async runStrategy(@Body() strategy: string,
                    @Query('symbol') symbol: string,
                    @Query('duration') duration: string,
                    @Query('range') range: string,
                    @Query('startTime') startTime: string,
                    @Query('endTime') endTime: string,
                    @Query('iteration') iteration: number): Promise<TestReport> {

    const _strategy: Strategy = new Strategy(strategy);
    const _symbol: Symbol = Symbol.fromSymbolName(symbol);
    const _duration: Duration = Duration.fromISO(duration);
    let _range: Duration = null;
    if (range) {
      _range = Duration.fromISO(range);
    }

    return this.testRunnerService.runStrategy(_strategy, _symbol, _duration, startTime, endTime, _range, iteration);
  }
}
