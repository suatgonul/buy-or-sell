import {Symbol} from '../../model/symbol';
import {DateTime, Duration} from 'luxon';
import {Candle} from '../../model/candle';

/**
 * Interface for interacting 3rd party data services
 */
export interface ThirdPartyDataIntegrator {
  /**
   * Fetches OHLC data
   * @param symbol Symbol for which the data to be fetched
   * @param duration Duration of the ticker
   * @param startTime Timestamp as the starting point of the data
   */
  fetchOhlcData(symbol: Symbol, duration: Duration, startTime: DateTime): Promise<Candle[]>;
}