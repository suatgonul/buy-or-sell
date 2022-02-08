/**
 * A currency pair
 */
export class Symbol {
  constructor(private mainInstrument: string, private valueInstrument: string) {
  }

  static fromSymbolName(name: string): Symbol {
    const symbolParts: string[] = name.split('_');
    return new Symbol(symbolParts[0], symbolParts[1]);
  }

  getName(): string {
    return this.mainInstrument + '_' + this.valueInstrument;
  }
}