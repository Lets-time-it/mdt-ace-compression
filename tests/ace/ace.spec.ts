import chai, { expect } from 'chai';
import ChaiAsPromised from 'chai-as-promised';
import * as Ace from '../../src/ace';

chai.use(ChaiAsPromised);

async function garbled() {
  return Ace.Deserialize('foobar');
}
describe('Ace helper method', () => {
  it('Fails on garbled data', async () => {
    expect(garbled()).to.be.rejectedWith(Error);
  });
  it('Understands v1 serialization', async () => {
    const input = '^1^F3^f-2';
    const output = await Ace.Deserialize(input);
    expect(output).to.be.closeTo(3 * (2 ** -2), 0.01);
  });
});
