/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-restricted-globals, consistent-return */

const express = require('express');
const Web3 = require('web3');
const { helpers, Tx, Input, Output } = require('parsec-lib');

const PLASMA_PROVIDER = 'https://testnet-1.parseclabs.org';
const web3 = helpers.extendWeb3(new Web3(PLASMA_PROVIDER));

const gamePriv =
  '0xbfafef54b578da46179c6d1964503368fd103e4d553c4ed4302d71acd3f62172';
const gameAccount = web3.eth.accounts.privateKeyToAccount(gamePriv);
const faucetPriv =
  '0xfa359762f1ea6c392901857a6c788bedc41a4ff2df96ce1b9b5cf2e800c2dfce';
const faucetAccount = web3.eth.accounts.privateKeyToAccount(faucetPriv);

const ADDR_REGEX = /0x[A-Fa-f0-9]{40}/;
const FUND_AMOUNT = 10000;

const app = express();

const last = (arr, n = 1) => arr[arr.length - n];

const VALUES = {
  ROCK: 0,
  SCISSORS: 1,
  PAPER: 2,
};

const rockPaperScissors = () => {
  return Math.round(Math.random() * 3);
};

const calcScore = (v1, v2) => {
  if (v1 === v2) {
    return 0;
  }

  return (v1 === VALUES.ROCK && v2 === VALUES.SCISSORS) ||
    (v1 === VALUES.PAPER && v2 === VALUES.ROCK) ||
    (v1 === VALUES.SCISSORS && v2 === VALUES.PAPER)
    ? 1
    : 0;
};

const calcScores = rounds => {
  const { players } = rounds[0];
  const result = {
    [players[0]]: 0,
    [players[1]]: 0,
  };
  for (const round of rounds) {
    const { [players[0]]: v1, [players[1]]: v2 } = round;
    result[players[0]] += calcScore(v1, v2);
    result[players[1]] += calcScore(v2, v1);
  }

  return result;
};

const calcDistribution = (scores, unspent, transactions) => {
  const [p1, p2] = Object.keys(scores);

  const inputs = unspent.map(u => new Input(u.outpoint));

  // draw
  if (scores[p1] === scores[p2]) {
    const outputs = transactions.map(t => new Output(t.value, t.from, 0));
    return Tx.transfer(inputs, outputs).signAll(gamePriv);
  }

  const stake = Math.min.apply(null, transactions.map(t => t.value));
  const pot = stake * 2;

  const winner = scores[p1] > scores[p2] ? p1 : p2;
  const outputs = [new Output(pot, winner, 0)];
  for (const tx of transactions) {
    if (tx.from !== p1 && tx.from !== p2) {
      outputs.push(new Output(tx.value, tx.from, 0));
    } else if (tx.value > stake) {
      // leftovers
      if (tx.from === winner) {
        outputs[0].value += tx.value - stake;
      } else {
        outputs.push(new Output(tx.value - stake, tx.from, 0));
      }
    }
  }

  return Tx.transfer(inputs, outputs).signAll(gamePriv);
};

const rounds = [];

const gameInfo = async address => {
  const unspent = await web3.getUnspent(address);
  const transactions = await Promise.all(
    unspent.map(u =>
      web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
    )
  );
  const addrs = transactions
    .map(t => t.from)
    .filter((addr, i, src) => src.indexOf(addr) === i);

  const lastRoundNumber = (last(rounds) && last(rounds).number) || 3;
  const latestRounds =
    addrs.length < 2 ? [] : rounds.slice(rounds.length - (lastRoundNumber % 3));

  return {
    address,
    players:
      latestRounds.length > 0 ? latestRounds[0].players : addrs.slice(0, 2),
    rounds: latestRounds,
  };
};

app.get('/games', async (request, response) => {
  response.send(JSON.stringify([await gameInfo(gameAccount.address)]));
});

app.post('/requestFunds/:addr', async (request, response, next) => {
  const { addr } = request.params;
  if (!ADDR_REGEX.test(addr)) {
    return next('Wrong request. Param — wallet address');
  }

  const reciever = addr;
  const unspent = await web3.getUnspent(faucetAccount.address);
  const inputs = helpers.calcInputs(
    unspent,
    faucetAccount.address,
    FUND_AMOUNT,
    0
  );
  const outputs = helpers.calcOutputs(
    unspent,
    inputs,
    faucetAccount.address,
    reciever,
    FUND_AMOUNT,
    0
  );
  const transfer = Tx.transfer(inputs, outputs).signAll(faucetPriv);

  const txHash = await web3.eth.sendSignedTransaction(transfer.toRaw());

  response.send(txHash);
});

app.post('/round/:gameAddr/:round', async (request, response, next) => {
  const { gameAddr } = request.params;
  const round = Number(request.params.round);
  if (!ADDR_REGEX.test(gameAddr) || isNaN(round)) {
    response.send(
      new Error(
        'Wrong request. First param — game address, second — round number (1-3)'
      )
    );
    return;
  }

  if (gameAccount.address !== gameAddr) {
    return next('Unknown game');
  }

  const unspent = await web3.getUnspent(gameAddr);
  const transactions = await Promise.all(
    unspent.map(u =>
      web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
    )
  );
  const addrs = transactions
    .map(t => t.from)
    .filter((addr, i, src) => src.indexOf(addr) === i);
  if (addrs.length < 2) {
    return next(`Not enough players (${addrs.length})`);
  }

  const lastRoundNumber = rounds.length === 0 ? 3 : last(rounds).number;

  if (
    (lastRoundNumber === 3 && round !== 1) ||
    (lastRoundNumber !== 3 && round - lastRoundNumber !== 1)
  ) {
    return next('Wrong round');
  }

  const players =
    lastRoundNumber === 3 ? addrs.slice(0, 2) : last(rounds).players;

  const newRound = {
    number: round,
    players,
    [players[0]]: rockPaperScissors(),
    [players[1]]: rockPaperScissors(),
  };

  rounds.push(newRound);

  if (round === 3) {
    const scores = calcScores(rounds.slice(round.length - 3));
    const distributionTx = calcDistribution(scores, unspent, transactions);
    await web3.eth.sendSignedTransaction(distributionTx.toRaw());
  }

  response.send('Ok');
});

app.listen(3005, () => {
  console.log('Listen on 3005');
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  /* eslint-enable */

  if (err) {
    res.status(500).send(
      JSON.stringify({
        type: 'error',
        message: err,
      })
    );
  }
});

exports.VALUES = VALUES;
exports.calcScore = calcScore;
exports.calcScores = calcScores;
exports.calcDistribution = calcDistribution;
