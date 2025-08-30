export class ProceduralScrollerError<
  T extends Record<string, unknown>,
> extends Error {
  public readonly data?: T;
  constructor(message: string, data?: T) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype); // Required for subclassing Error in ES5
    if (data) {
      console.warn(`${this.constructor.name} data: `, data);
    }
  }
}
