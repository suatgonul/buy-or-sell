import {Expression} from './expression';
import {ExpressionFactory} from './expression-factory';

export class ExpressionGroup implements Expression {
  operator: AssociationOperator;
  expressions: Expression[];

  constructor(data: any) {
    this.operator = data.operator;
    this.expressions = data.expressions.map(expression => ExpressionFactory.createExpression(expression));
  }
}

export enum AssociationOperator {
  AND = 'AND',
  OR = 'OR'
}