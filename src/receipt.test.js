const Receipt = require('./receipt');

const ADDR = '0x983f0159242a8eef9bbe5ac3e02d96aa3252dd9c';
const PRIV =
  '0x84207865074c52f6b39b31a5315e0f820ac078921888d86d193454f95777c855';

test('Create and parse', () => {
  const r1 = Receipt.parse(Receipt.create(1, 0, PRIV));
  const r2 = Receipt.parse(Receipt.create(2, 1, PRIV));
  const r3 = Receipt.parse(Receipt.create(3, 2, PRIV));

  expect(r1.signer).toBe(ADDR);
  expect(r1.value).toBe(0);
  expect(r1.round).toBe(1);

  expect(r2.signer).toBe(ADDR);
  expect(r2.value).toBe(1);
  expect(r2.round).toBe(2);

  expect(r3.signer).toBe(ADDR);
  expect(r3.value).toBe(2);
  expect(r3.round).toBe(3);
});
