import {Value} from './value';
import {ValueFactory} from './value-factory';

export class OperatorValue extends Value {
  operator: string;
  parameters: Value[];

  constructor(data: any) {
    super();
    this.operator = data.operator;
    if (data.parameters) {
      this.parameters = data.parameters.map(parameter => {
        return ValueFactory.createValue(parameter);
      })
    }
  }
}

export enum DataOperator {
  PLUS = '+',
  MINUS = '-',
  DIV = '/',
  MULT = '*',
  MA = 'MA'
}