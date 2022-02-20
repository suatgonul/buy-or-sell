import {Function} from '../model/expression/function';
import {Value} from '../model/expression/value';
import {SingleValue} from '../model/expression/single-value';
import {NumericFunction} from '../model/expression/numeric-function';

export abstract class BaseFunction implements Function {

  protected constructor(protected windowLength: number = 0) {
  }

  getValueWindowLength(value: Value): number {
    if (value instanceof SingleValue) {
      return 0;
    } else {
      return (value as NumericFunction).getWindowLength();
    }
  }

  getWindowLength(): number {
    return this.windowLength;
  }
}