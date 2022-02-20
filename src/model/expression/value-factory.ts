import {SingleValue} from './single-value';
import {Value} from './value';
import {Function} from './function';
import {MovingAverage} from '../../function/numeric/moving-average';
import {Ref} from '../../function/numeric/ref';

export abstract class ValueFactory {
  public static createValue(data: any): Value {
    if (data.klass === 'SingleValue') {
      return new SingleValue(data);
    } else {
      return ValueFactory.createNumericFunction(data);
    }
  }

  private static createNumericFunction(data: any): Function {
    const parameters: any = data.parameters;
    switch (data.name) {
      case NumericFunctionName.MOVING_AVERAGE: {
        const value: Value = ValueFactory.createValue(parameters.data);
        const windowLength: number = parameters.windowLength;
        return new MovingAverage(value, windowLength);
      }
      case NumericFunctionName.REFERENCE: {
        const value: Value = ValueFactory.createValue(parameters.data);
        const windowLength: number = parameters.windowLength;
        return new Ref(value, windowLength);
      }
    }
  }
}

export enum NumericFunctionName {
  MOVING_AVERAGE = 'MA',
  REFERENCE = 'REF'
}