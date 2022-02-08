import {Controller, Get, Query} from '@nestjs/common';
import {Symbol} from '../../model/symbol';
import {Duration} from 'luxon';
import {DataManagerService} from '../data-manager.service';

@Controller('data')
export class DataIntegrationController {
  constructor(private dataManagerService: DataManagerService) {
  }

  /**
   * Fetches OHLC (open-high-low-close) data with the injected data manager service until the current time
   * @param symbol Symbol for which the data to be fetched
   * @param duration Ticker duration for
   */
  @Get('populate/ohlc')
  async populateOhlcData(@Query('symbol') symbol: string,
                         @Query('duration') duration: string): Promise<void> {

    const _symbol: Symbol = Symbol.fromSymbolName(symbol);
    const _duration: Duration = Duration.fromISO(duration);

    return this.dataManagerService.populateOhlcData(_symbol, _duration);
  }
}
