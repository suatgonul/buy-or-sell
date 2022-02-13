import {SingleValue} from './single-value';
import {Value} from './value';
import {OperatorValue} from './operator-value';

export abstract class ValueFactory {
  public static createValue(data: any): Value {
    if (data.klass === 'SingleValue') {
      return new SingleValue(data);
    } else if (data.klass === 'OperatorValue') {
      return new OperatorValue(data);
    }
  }
}