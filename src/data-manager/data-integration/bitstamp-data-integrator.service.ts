import {ThirdPartyDataIntegrator} from './third-party-data-integrator';
import {Injectable} from '@nestjs/common';
import {Symbol} from '../../model/symbol';
import axios from 'axios';
import {DateTime, Duration} from 'luxon';
import {Candle} from '../../model/candle';

const BITSTAMP_BASE_URL = 'https://www.bitstamp.net/api/v2/';
const OHLC_ENDPOINT = 'ohlc/';

@Injectable()
export class BitstampDataIntegrator implements ThirdPartyDataIntegrator {

  fetchOhlcData(symbol: Symbol, duration: Duration, startTime: DateTime): Promise<Candle[]> {
    const symbolName: string = symbol.getName().replace('_', '').toLowerCase();
    const startTimeInSeconds: number = startTime.toSeconds();
    return axios.get(`${BITSTAMP_BASE_URL}${OHLC_ENDPOINT}${symbolName}/`, {
      params: {
        step: duration.as('seconds'),
        start: startTimeInSeconds,
        limit: 1000
      }
    })
    .then(function (response) {
      return response.data.data.ohlc.map(ohlc =>
        new Candle(
          DateTime.fromSeconds(Number.parseInt(ohlc.timestamp)),
          Number.parseFloat(ohlc.open),
          Number.parseFloat(ohlc.high),
          Number.parseFloat(ohlc.low),
          Number.parseFloat(ohlc.close),
          Number.parseFloat(ohlc.volume)
        )
      );
    })
    .catch(function (error) {
      console.error(error);
      return [];
    });
  }


}