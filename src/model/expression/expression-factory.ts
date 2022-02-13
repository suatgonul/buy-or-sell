import {Expression} from './expression';
import {ExpressionGroup} from './expression-group';
import {SingleExpression} from './single-expression';

export abstract class ExpressionFactory {
  public static createExpression(data: any): Expression {
    if (data.klass === 'SingleExpression') {
      return new SingleExpression(data);
    } else if (data.klass === 'ExpressionGroup') {
      return new ExpressionGroup(data);
    }
  }
}