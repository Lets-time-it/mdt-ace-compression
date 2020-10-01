import { expect } from 'chai';
import * as Ace from '../../src/ace';

describe('Ace helper method', () => {
  it('Understands v1 serialization', async () => {
    const input = '^1^F3^f-2';
    const output = await Ace.Deserialize(input);
    expect(output).to.be.closeTo(3 * (2 ** -2), 0.01);
  });
});
