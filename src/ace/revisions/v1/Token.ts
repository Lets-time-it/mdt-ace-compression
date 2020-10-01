export default class Token {
  public type:string;

  public data:string;

  constructor(type:string, data:string) {
    this.type = type;
    this.data = data;
  }
}
