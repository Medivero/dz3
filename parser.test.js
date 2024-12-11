const { parseConfig } = require('../parser');
const assert = require('assert');

describe('Parser', () => {
  it('parses variables and expressions', () => {
    const input = `
      var x = 10
      var y = (1, 2, 3)
      {x 2 *}
      {y sort()}
    `;
    const output = parseConfig(input);

    assert(output.includes('x = 10'));
    assert(output.includes('y = [1, 2, 3]'));
    assert(output.includes('expression_3 = 20'));
    assert(output.includes('expression_4 = [1, 2, 3]'));
  });

  it('throws on invalid syntax', () => {
    const input = `var x =`;
    assert.throws(() => parseConfig(input), /Ошибка синтаксиса/);
  });
});
