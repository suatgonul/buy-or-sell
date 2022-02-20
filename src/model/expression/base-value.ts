import {Value} from './value';
import {SingleValue} from './single-value';
import {NumericFunction} from './numeric-function';

export class BaseValue implements Value {
  getWindowLength(value: Value): number {
    if (value instanceof SingleValue) {
      return 0;
    } else {
      return (value as NumericFunction).getWindowLength();
    }
  }
}