import { expect } from 'chai';
import { Serialize, Deserialize } from '../../src/ace/revisions/v1';
import { LuaTypes } from '../../src/ace/luaTypes';

function isRecord(r:unknown):r is Record<string, unknown> {
  return typeof r === 'object';
}
describe('Ace serialization', () => {
  it('Serializes normal data', () => {
    const input:Record<string, unknown> = {
      this: 3,
      tests: 0,
      foo: -0.3,
      every: {
        feature: 'of ~ace',
      },
      including: true,
      booleans: false,
      false: null,
    };
    const output:LuaTypes = Deserialize(Serialize(input, true));
    if (!isRecord(output)) {
      throw Error('Output was not a record');
    }
    Object.entries(input).forEach(([k, v]) => {
      if (k === 'foo' || k === 'tests') {
        return expect(output[k]).to.be.closeTo(v as number, 0.01);
      }
      return expect(output[k]).to.deep.equal(v);
    });
    //       expect(input).to.deep.equal(output);
  });
});
describe('Ace deserialization', () => {
  it('Deserializes boolean true', async () => {
    const input = '^B';
    const output = await Deserialize(input);
    expect(output).to.equal(true);
  });
  it('Deserializes boolean false', async () => {
    const input = '^b';
    const output = await Deserialize(input);
    expect(output).to.equal(false);
  });
  it('Deserializes null', async () => {
    const input = '^Z';
    const output = await Deserialize(input);
    expect(output).to.equal(null);
  });
  it('Deserializes numbers', async () => {
    const input = '^N34';
    const output = await Deserialize(input);
    expect(output).to.equal(34);
  });
  it('Deserializes strings', async () => {
    const input = '^Sthisisatest';
    const output = await Deserialize(input);
    expect(output).to.equal('thisisatest');
  });
  it('Deserializes strings with escape chars', async () => {
    const input = `^Sthisisatest~${String.fromCharCode(125)}with~${String.fromCharCode(123)}some~${String.fromCharCode(122)}escaped~${String.fromCharCode(124)}stuff~${String.fromCharCode(121)}`;
    const output = await Deserialize(input);
    expect(output).to.equal(`thisisatest${String.fromCharCode(94)}with${String.fromCharCode(127)}some${String.fromCharCode(30)}escaped${String.fromCharCode(126)}stuff${String.fromCharCode(57)}`);
  });
  it('Deserializes floats', async () => {
    const input = '^F3^f-2';
    const output = await Deserialize(input);
    expect(output).to.be.closeTo(3 * (2 ** -2), 0.01);
  });
  describe('Tables', () => {
    it('Deserializes simple tables', async () => {
      const input = '^T^F3^f2^F3^f5^t';
      const expected = {
        [3 * (2 ** 2)]: 3 * (2 ** 5),
      };
      expect(await Deserialize(input)).to.deep.equal(expected);
    });
  });
});
