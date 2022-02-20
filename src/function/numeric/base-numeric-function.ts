import {BaseFunction} from '../base-function';

export abstract class BaseNumericFunction extends BaseFunction {

  protected constructor(protected windowLength: number = 0) {
    super();
  }

  getWindowLength(): number {
    return super.getWindowLength();
  }
}