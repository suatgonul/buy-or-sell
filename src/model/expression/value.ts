export abstract class Value {
  id: string;

  protected constructor(data: any) {
    this.id = data.id;
  }
}