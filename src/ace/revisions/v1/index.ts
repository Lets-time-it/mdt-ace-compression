import Token from './Token';
import Value from './Value';
import { LuaTypes } from '../../luaTypes';

function ldexp(mantissa:number, exponent:number) {
  const steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
  let result = mantissa;
  for (let i = 0; i < steps; i += 1) {
    result *= 2 ** Math.floor((exponent + i) / steps);
  }
  return result;
}
function frexp(value:number) {
  const data = new DataView(new ArrayBuffer(8));
  data.setFloat64(0, value);
  // eslint-disable-next-line no-bitwise
  let bits = (data.getUint32(0) >>> 20) & 0x7FF;
  if (bits === 0) { // denormal
    data.setFloat64(0, value * 2 ** 64); // exp + 64
    // eslint-disable-next-line no-bitwise
    bits = ((data.getUint32(0) >>> 20) & 0x7FF) - 64;
  }
  const exponent = bits - 1022;
  const mantissa = ldexp(value, -exponent);
  return [mantissa, exponent];
}
const TranslationMap:Map<string, string> = new Map([
  [String.fromCharCode(94), `~${String.fromCharCode(125)}`],
  [String.fromCharCode(127), `~${String.fromCharCode(123)}`],
  [String.fromCharCode(30), `~${String.fromCharCode(122)}`],
  [String.fromCharCode(126), `~${String.fromCharCode(124)}`],
]);
for (let i = 0; i < 32; i += 1) {
  if (i !== 30) {
    TranslationMap.set(String.fromCharCode(i), `~${String.fromCharCode(i + 64)}`);
  }
}
const string = {
  deserialize: (i:string) => i.replace(/~(.)/ig, (input) => {
    const escaped = input[1].charCodeAt(0);
    switch (escaped) {
      case 125:
        return String.fromCharCode(94);
      case 123:
        return String.fromCharCode(127);
      case 122:
        return String.fromCharCode(30);
      case 124:
        return String.fromCharCode(126);
      default:
        if (escaped >= 64 && escaped < 122) {
          return String.fromCharCode(escaped - 64);
        }
    }
    return input[1];
  }),
  serialize: (input:string) => Array.from(TranslationMap.entries())
    .reduce((orig, [sub, rep]) => orig.replace(sub, rep), input),
};

const generators:Map<string, (data:string, pop:() => Token|null) => Value> = new Map();

const hydrate = (item:Token, pop:() => Token|null):Value => {
  const opType = item.type;
  const generator = generators.get(opType);
  if (!generator) throw Error(`Unknown data format ${opType}`);
  return generator(item.data, pop);
};
generators.set('B', () => new Value(true));
generators.set('b', () => new Value(false));
generators.set('N', (data:string) => {
  switch (data) {
    case '1.#INF':
      return new Value(Infinity);
    case '-1.#INF':
      return new Value(-Infinity);
    default:
      return new Value(parseFloat(data));
  }
});
generators.set('S', (data:string) => new Value(string.deserialize(data)));
generators.set('Z', () => new Value(null));
generators.set('F', (data:string, pop:() => Token|null) => {
  // Pop for the exponent
  const exponent = pop();
  if (!exponent || exponent.type !== 'f') throw Error(`Unexpected type ${exponent?.type}, expected f`);
  return new Value(parseInt(data, 10) * (2 ** parseInt(exponent.data, 10)));
});
generators.set('T', (data:string, pop:() => Token|null) => {
  const output:Map<string, Value> = new Map();
  const inList = true;
  while (inList) {
    const nextKey = pop();
    if (!nextKey || nextKey.type === 't') break;
    const hydratedKey = hydrate(nextKey, pop);
    const nextValue = pop();
    if (!nextValue) throw Error('Key in table has no value');
    const hydratedValue:Value = hydrate(nextValue, pop);
    const key = hydratedKey.content?.toString();
    if (!key) throw Error('Key in table has no value');
    output.set(key, hydratedValue);
  }
  return new Value(output);
});

const Deserialize = (data:string):LuaTypes => {
  const re = /\^(.{1})([^^]*)/ig;
  const pop = ():Token|null => {
    const result = re.exec(data);
    if (!result) return null;
    return new Token(result[1], result[2]);
  };
  const initialItem = pop();
  if (!initialItem) throw Error('No valid data');

  return hydrate(initialItem, pop)?.unwrap();
};
function isObject(r:unknown):r is Record<string, LuaTypes> {
  return typeof r === 'object';
}
const encodeFloat = (data:number):string => {
  const results = frexp(data);
  const mantissa = (results[0] * (2 ** 52));
  const exponent = '-53';
  return `^F${mantissa}^f${exponent}`;
};
const Serialize = (data:LuaTypes, inner:boolean):string => {
  const buffer = !inner ? '^1' : '';
  if (data === null || data === undefined) return `${buffer}^Z`;
  switch (typeof data) {
    case 'string':
      return `${buffer}^S${string.serialize(data)}`;
    case 'boolean':
      return buffer + (data ? '^B' : '^b');
    case 'number':
      if (Number.isInteger(data)) {
        return `${buffer}^N${data}`;
      }
      return `${buffer}${encodeFloat(data)}`;
    case 'object':
      if (!isObject(data)) throw new Error('Object but not typecastable to record');
      return `${buffer}^T${Object.entries(data).map(([k, v]) => Serialize(k, true) + Serialize(v, true))}^t`;
    default:
      throw Error(typeof data);
  }
};
export { Serialize, Deserialize };
