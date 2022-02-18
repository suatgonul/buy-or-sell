import {DateTime, Duration} from 'luxon';

/**
 * Candle data for a symbol
 */
export class Candle {
  constructor(public timestamp: DateTime,
              public open: number,
              public high: number,
              public low: number,
              public close: number,
              public volume: number,
              public duration: Duration = null) {
  }

  public toReadableJson(): any {
    const {timestamp, duration, ...rest} = this;
    return {
      ...rest,
      timestamp: timestamp.toISO(),
      duration: duration.toISO()
    }
  }

  public
}