import {Expression} from './expression';

export class SingleExpression extends Expression {
  operator: ConditionOperator;
  metrics: string[];

  constructor(data: any) {
    super();
    this.operator = data.operator;
    this.metrics = data.metrics;
  }
}

export enum ConditionOperator {
  LESS_THAN = '<',
  CROSS = 'CROSS'
}