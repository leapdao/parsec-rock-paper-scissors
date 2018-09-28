const { Tx, Input, Output } = require('parsec-lib');

const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;

const last = (arr, n = 1) => arr[arr.length - n];

const not = fn => (...args) => !fn(...args);

const isPendingRound = round =>
  !round.result ||
  round.result[round.players[0]] === undefined ||
  round.result[round.players[1]] === undefined;

async function cleanupTheGame(web3, game) {
  const unspent = await web3.getUnspent(game.address);
  const inputs = unspent.map(u => new Input(u.outpoint));
  const transactions = await Promise.all(
    unspent.map(u =>
      web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
    )
  );
  const outputs = transactions.map(t => new Output(Number(t.value), t.from, 0));
  const tx = Tx.transfer(inputs, outputs).signAll(game.privateKey);
  return web3.eth.sendSignedTransaction(tx.toRaw());
}

exports.cleanupTheGame = cleanupTheGame;
exports.last = last;
exports.not = not;
exports.isPendingRound = isPendingRound;
exports.ADDR_REGEX = ADDR_REGEX;
