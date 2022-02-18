import {Value} from './value';

export class SingleValue extends Value {
  constantValue: number;
  dataRef: DataRef;
  metric: string;

  constructor(data: any) {
    super(data);
    this.constantValue = data.constantValue;
    this.dataRef = data.dataRef;
    this.metric = data.metric;
  }
}

export enum DataRef {
  O = 'O',
  H = 'H',
  L = 'L',
  C = 'C'
}