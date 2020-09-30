export default class Value {
  content: boolean | null | string | number | Map<string, Value>;

  constructor(value: boolean | null | string | number | Map<string, Value>) {
    this.content = value;
  }

  unwrap():boolean | null | string | number | Record<string, unknown> {
    if (!(this.content instanceof Map)) return this.content;
    // Last possible case is a map
    const out = Object.create(null);
    if (this.content instanceof Map) {
      Array.from(this.content.entries()).forEach(([k, v]:[string, Value]) => {
        out[k] = v.unwrap();
      });
    }
    return out;
  }
}
