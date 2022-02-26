import {Expression} from './expression';
import {ExpressionGroup} from './expression-group';
import {Function} from './function';
import {Value} from './value';
import {ValueFactory} from './value-factory';
import {BasicComparison} from '../../function/conditional/basic-comparison';

export abstract class ExpressionFactory {
  public static createExpression(data: any): Expression {
    if (data.klass === 'ExpressionGroup') {
      return new ExpressionGroup(data);
    } else {
      return ExpressionFactory.createConditionalFunction(data);
    }
  }

  private static createConditionalFunction(data: any): Function {
    const parameters: any = data.parameters;
    switch (data.name) {
      case ConditionalFunctionName.LESS_THAN:
      case ConditionalFunctionName.LESS_THAN_OR_EQUAL:
      case ConditionalFunctionName.GREATER_THAN:
      case ConditionalFunctionName.GREATER_THAN_OR_EQUAL: {
        const firstValue: Value = ValueFactory.createValue(parameters.firstValue);
        const secondValue: Value = ValueFactory.createValue(parameters.secondValue);
        return new BasicComparison(data.name, firstValue, secondValue);
      }
    }
  }
}

export enum ConditionalFunctionName {
  LESS_THAN = '<',
  LESS_THAN_OR_EQUAL = '<=',
  GREATER_THAN = '>',
  GREATER_THAN_OR_EQUAL = '>=',
  CROSS = 'CROSS'
}