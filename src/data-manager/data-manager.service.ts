import {Injectable} from '@nestjs/common';
import {BitstampDataIntegrator} from './data-integration/bitstamp-data-integrator.service';
import {DateTime, Duration} from 'luxon';
import {Symbol} from '../model/symbol';
import {Candle} from '../model/candle';
import {TimescaleDbService} from './db/timescaledb/timescale-db.service';
import {START_UNIX_TIMESTAMP} from '../constant/constants';
import {RuntimeException} from '@nestjs/core/errors/exceptions/runtime.exception';
import {addDuration} from '../util/date-time-utils';

@Injectable()
export class DataManagerService {
  constructor(private dataIntegrator: BitstampDataIntegrator, private timescaleDb: TimescaleDbService) {
  }

  /**
   * Fetchs the missing OHLC data for the given symbol by checking the last record in the database.
   * @param symbol
   * @param duration
   */
  async populateOhlcData(symbol: Symbol, duration: Duration): Promise<void> {
    let startTime: DateTime = await this.getStartTimestamp(symbol, duration);
    if (startTime) {
      let lastBatchStartTime: DateTime;
      let lastBatchEndTime: DateTime;
      let fetchNextBatch: boolean;
      do {
        console.info('start time', startTime.toISO());
        fetchNextBatch = false;
        lastBatchStartTime = startTime;
        // fetch data from the third party data provider
        const candles: Candle[] = await this.dataIntegrator.fetchOhlcData(symbol, duration, startTime);
        // save the fetch data in the DB
        await this.timescaleDb.saveCandles(symbol, duration, candles);
        console.info(`Candles saved for ${duration.toISO()}, starting from ${startTime.toISO()}`);
        lastBatchEndTime = candles[candles.length - 1].timestamp;

        // increase the start time by a factor of 1000 multiplied by the duration
        startTime = this.getTimestampForNextBatch(lastBatchStartTime, duration);

        const now: DateTime = DateTime.now();
        // fetch next batch if
        // 1) the next start time is still before than the current time
        // 2) difference between the current time and the last fetch time is longer than the duration amount
        fetchNextBatch = startTime.diff(now).toMillis() <= 0 || now.diff(lastBatchEndTime).toMillis() > duration.toMillis()

      } while (fetchNextBatch);
    }
    return Promise.resolve();
  }


  /**
   * Gets the first timestamp that should be fetched from the database for the given symbol and duration. If there is a record in the DB, it returns the value
   * obtained by adding the duration to the timestamp of the latest record. Otherwise, START_UNIX_TIMESTAMP value is used.
   * @param symbol
   * @param duration
   * @private
   */
  private getStartTimestamp(symbol: Symbol, duration: Duration): Promise<DateTime> {
    return this.timescaleDb.getLatestTimestamp(symbol, duration).then(timestamp => {
      if (timestamp) {
        const nextTimeStamp: DateTime = timestamp.plus(duration);
        if (nextTimeStamp.diffNow().toMillis() > 0) {
          return null;
        } else {
          return nextTimeStamp;
        }
      } else {
        return DateTime.fromSeconds(START_UNIX_TIMESTAMP);
      }
    })
  }

  /**
   * Gets timestamp as the starting point of the next batch. It is calculated by adding the duration amount multiplied by the batch size to current timestamp given as offset.
   * @param currentTimestamp Timestamp corresponding to the first record of the previous batch
   * @param duration Duration of the symbol ticks
   * @param batchSize Number of records included in the batch
   * @private
   */
  private getTimestampForNextBatch(currentTimestamp: DateTime, duration: Duration, batchSize = 1000): DateTime {
    return addDuration(currentTimestamp, duration, batchSize);
  }
}