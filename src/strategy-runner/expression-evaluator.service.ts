import {Injectable} from '@nestjs/common';
import {Strategy} from '../model/strategy';
import {DateTime, Duration} from 'luxon';
import {TimescaleDbService} from '../data-manager/db/timescaledb/timescale-db.service';
import {Symbol} from '../model/symbol';
import {Candle} from '../model/candle';
import {Signal} from '../model/signal';
import {TestReport} from '../model/report/test-report';
import {TradeAction} from '../model/report/trade-action';
import {Value} from '../model/expression/value';
import {SingleValue} from '../model/expression/single-value';
import {OperatorValue} from '../model/expression/operator-value';
import {DataCollectorService} from '../data-manager/data-collector.service';

@Injectable()
export class ExpressionEvaluatorService {
  constructor(private dataCollectorService: DataCollectorService) {
  }

  evaluateValue(value: Value): boolean {
    if (value instanceof SingleValue) {

    } else if (value instanceof OperatorValue) {

    }
    return false;
  }

  private evaluateSingleValue(value: SingleValue): number {
    if (value.constantValue) {
      return value.constantValue;
    } else {

    }
  }

  private resolveDataRef(): number {
    return 0;
  }

  private evaluateOperatorValue(value: OperatorValue): number {
    return 0;
  }
}