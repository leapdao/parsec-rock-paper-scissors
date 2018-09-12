const ethUtil = require('ethereumjs-util');

function hash(round, value) {
  return ethUtil.sha3(Buffer.from(String(round) + String(value)));
}

function create(round, value, privKey) {
  const sig = ethUtil.ecsign(
    hash(round, value),
    Buffer.from(privKey.replace('0x', ''), 'hex')
  );

  const receipt = Buffer.alloc(67, 0);
  receipt.writeUInt8(round, 0);
  receipt.writeUInt8(value, 1);
  sig.r.copy(receipt, 2);
  sig.s.copy(receipt, 34);
  receipt.writeUInt8(sig.v, 66);

  return ethUtil.bufferToHex(receipt);
}

function parse(receipt) {
  const receiptBuf = Buffer.from(receipt.slice(2), 'hex'); // eslint-disable-line
  if (receiptBuf.length !== 67) {
    throw new Error('Wrong receipt');
  }

  const round = parseInt(receiptBuf.slice(0, 1).toString('hex'), 16);
  const value = parseInt(receiptBuf.slice(1, 2).toString('hex'), 16);
  const r = receiptBuf.slice(2, 34);
  const s = receiptBuf.slice(34, 66);
  const v = parseInt(receiptBuf.slice(66, 67).toString('hex'), 16);

  return {
    round,
    value,
    signer: ethUtil.bufferToHex(
      ethUtil.pubToAddress(ethUtil.ecrecover(hash(round, value), v, r, s))
    ),
  };
}

exports.create = create;
exports.parse = parse;
