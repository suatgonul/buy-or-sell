import {Value} from '../model/expression/value';
import {Function} from '../model/expression/function';
import {OperatorValue} from '../model/expression/operator-value';
import {MovingAverage} from './moving-average';
import {SingleValue} from '../model/expression/single-value';
import {Ref} from './ref';

export abstract class FunctionFactory {
  public static convertValueToFunction(operatorValue: OperatorValue): Function {
    switch (operatorValue.operator) {
      case FunctionName.MOVING_AVERAGE: {
        const value: Value = operatorValue.parameters[0];
        const windowLength = (operatorValue.parameters[1] as SingleValue).constantValue;
        return new MovingAverage(value, windowLength);
      }
      case FunctionName.REFERENCE: {
        const value: Value = operatorValue.parameters[1];
        const windowLength = (operatorValue.parameters[0] as SingleValue).constantValue;
        return new Ref(value, windowLength);
      }
    }
    return null;
  }
}

export enum FunctionName {
  MOVING_AVERAGE = 'MA',
  REFERENCE = 'REF'
}