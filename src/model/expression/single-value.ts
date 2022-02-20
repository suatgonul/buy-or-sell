import {Value} from './value';

export class SingleValue implements Value {
  constantValue: number;
  dataRef: DataRef;

  constructor(data: any) {
    this.constantValue = data.constantValue;
    this.dataRef = data.dataRef;
  }
}

export enum DataRef {
  O = 'O',
  H = 'H',
  L = 'L',
  C = 'C'
}