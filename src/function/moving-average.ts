import {BaseFunction} from './base-function';
import {Value} from '../model/expression/value';

export class MovingAverage extends BaseFunction {

  constructor(public value: Value, public windowLength: number) {
    super();
  }

  getWindowLength(): number {
    return this.windowLength;
  }
}