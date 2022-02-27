/**
 * Candle data for a symbol
 */
import {Position} from './position';

export class TestReport {
    constructor(public positions: Position[], public performance: number) {
  }
}