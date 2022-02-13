import {Operator} from './operator';

export interface Function extends Operator {
  getWindowLength(): number;
}