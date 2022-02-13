import {Function} from '../model/expression/function';

export abstract class BaseFunction implements Function {
  getWindowLength(): number {
    return 0;
  }
}