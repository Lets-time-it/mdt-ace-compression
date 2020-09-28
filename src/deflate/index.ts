import DeflateJS from 'deflate-js';

const Deflate = (data:Array<number>):Array<number> => DeflateJS.deflate(data);
const Inflate = (data:Array<number>):Array<number> => DeflateJS.inflate(data);

const mappingTable = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
  'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
  'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
  'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V',
  'W', 'X', 'Y', 'Z', '0', '1', '2', '3',
  '4', '5', '6', '7', '8', '9', '(', ')',
];
const convertByteTo6bit = (chr:number):number => mappingTable[chr].charCodeAt(0);
const convert6bitToByte = (chr:number):number => {
  if (chr >= 97) return chr - 97;
  if (chr >= 65) return chr - 65 + 26;
  if (chr >= 48) return chr - 48 + 52;
  if (chr === 40) return 62;
  if (chr === 41) return 63;
  return chr;
};
const DecodeForPrint = (sData:string):Array<number> => {
  const data = sData
    .replace(/^[^\x21-\x7E]+/g, '')
    .replace(/[^\x21-\x7E]+$/g, '');
  const strlen = data.length;
  const strlenMinus3 = data.length - 3;
  let i = 0;
  let buffer:Array<number> = [];
  while (i < strlenMinus3) {
    let x1:number = data.charCodeAt(i);
    let x2:number = data.charCodeAt(i + 1);
    let x3:number = data.charCodeAt(i + 2);
    let x4:number = data.charCodeAt(i + 3);
    x1 = convert6bitToByte(x1);
    x2 = convert6bitToByte(x2);
    x3 = convert6bitToByte(x3);
    x4 = convert6bitToByte(x4);
    if (!(x1 >= 0 && x2 >= 0 && x3 >= 0 && x4 >= 0)) {
      throw Error('Null bytes found');
    }
    i += 4;
    let cache = x1 + x2 * 64 + x3 * 4096 + x4 * 262144;
    const b1 = cache % 256;
    cache = (cache - b1) / 256;
    const b2 = cache % 256;
    const b3 = (cache - b2) / 256;
    buffer = buffer.concat([b1, b2, b3]);
  }
  let cache = 0;
  let cacheBitlen = 0;
  while (i < strlen) {
    let x = data.charCodeAt(i);
    x = convert6bitToByte(x);
    if (x < 0) {
      throw Error('Invalid byte returned');
    }
    cache += x * (2 ** cacheBitlen);
    cacheBitlen += 6;
    i += 1;
  }
  while (cacheBitlen >= 8) {
    const byte = cache % 256;
    buffer.push(byte);
    cache = (cache - byte) / 256;
    cacheBitlen -= 8;
  }
  return buffer;
};
const EncodeForPrint = (input:Array<number>):string => {
  const strlen = input.length;
  const lenMinus2 = strlen - 2;
  let i = 0;
  let buffer:Array<number> = [];
  while (i < lenMinus2) {
    const x1 = input[i];
    const x2 = input[i + 1];
    const x3 = input[i + 2];
    i += 3;
    let cache = x1 + x2 * 256 + x3 * 65536;
    const b1 = cache % 64;
    cache = (cache - b1) / 64;
    const b2 = cache % 64;
    cache = (cache - b2) / 64;
    const b3 = cache % 64;
    const b4 = (cache - b3) / 64;
    buffer = buffer.concat([
      convertByteTo6bit(b1),
      convertByteTo6bit(b2),
      convertByteTo6bit(b3),
      convertByteTo6bit(b4),
    ]);
  }
  return buffer.map((e) => String.fromCharCode(e)).join('');
};
export {
  Deflate, Inflate, DecodeForPrint, EncodeForPrint,
};
