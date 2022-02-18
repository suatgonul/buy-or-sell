import {Expression} from './expression';
import {Value} from './value';
import {ValueFactory} from './value-factory';

export class SingleExpression extends Expression {
  operator: ConditionOperator;
  parameters: Value[];

  constructor(data: any) {
    super();
    this.operator = data.operator;
    this.parameters = data.parameters.map(parameter => ValueFactory.createValue(parameter));
  }
}

export enum ConditionOperator {
  LESS_THAN = '<',
  CROSS = 'CROSS'
}