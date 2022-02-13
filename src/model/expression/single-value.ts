import {Value} from './value';

export class SingleValue extends Value {
  constantValue: number;
  dataRef: DataRef;

  constructor(data: any) {
    super();
    this.constantValue = data.constantValue;
    this.dataRef = data.dataRef;
  }
}

export enum DataRef {
  O,
  H,
  L,
  C
}