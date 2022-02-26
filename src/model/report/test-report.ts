/**
 * Candle data for a symbol
 */
import {Position} from './position';
import {TestStatistics} from './test-statistics';

export class TestReport {
  lastPrice: number;
  testStatistics: TestStatistics;

  constructor(public position: Position) {
  }
}