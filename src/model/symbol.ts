/**
 * A currency pair
 */
export class Symbol {
  constructor(public mainInstrument: string, public fiat: string) {
  }

  static fromSymbolName(name: string): Symbol {
    const symbolParts: string[] = name.split('_');
    return new Symbol(symbolParts[0], symbolParts[1]);
  }

  getName(): string {
    return this.mainInstrument + '_' + this.fiat;
  }
}