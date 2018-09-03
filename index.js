/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-restricted-globals */

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
const PSC = 1000000000;

const app = express();

const last = (arr, n = 1) => arr[arr.length - n];

// 1. rock 2. scissors 3. paper
const rockPaperScissors = () => {
  return [][Math.round(Math.random() * 3)];
};

const calcScores = rounds => {
  const { players } = rounds[0];
  const result = {
    [players[0]]: 0,
    [players[1]]: 0,
  };
  for (const round of rounds) {
    const diff = round[players[0]] - round[players[1]];
    if (diff >= -1 && diff <= 2) {
      result[players[0]] += 1;
    }

    if (diff >= -2 && diff <= 1) {
      result[players[1]] += 1;
    }
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
    // leftovers
    if (tx.value > stake) {
      outputs.push(new Output(tx.value - stake, tx.from, 0));
    }
  }

  return Tx.transfer(inputs, outputs);
};

app.post('requestFunds/:addr', async (request, response) => {
  const { addr } = response.params;
  if (!ADDR_REGEX.test(addr)) {
    throw new Error('Wrong request. Param — wallet address');
  }

  const reciever = addr;
  const unspent = await web3.getUnspent(faucetAccount.address);
  const inputs = helpers.calcInputs(unspent, faucetAccount.address, PSC, 0);
  const outputs = helpers.calcOutputs(
    unspent,
    inputs,
    faucetAccount.address,
    reciever,
    PSC,
    0
  );
  const transfer = Tx.transfer(inputs, outputs).signAll(faucetPriv);

  const txHash = await web3.eth.sendSignedTransaction(
    transfer.toRaw().toString('hex')
  );

  response.send(txHash);
});

const rounds = [];
app.post('round/:gameAddr/:round', async (request, response) => {
  const { gameAddr } = request.params;
  const round = Number(request.params.round);
  if (!ADDR_REGEX.test(gameAddr) || isNaN(round)) {
    throw new Error(
      'Wrong request. First param — game address, second — round number (1-3)'
    );
  }

  if (gameAccount.address !== gameAddr) {
    throw new Error('Unknown game');
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
    throw new Error('Not enough players');
  }

  const lastRoundNumber = rounds.length === 0 ? last(rounds).number : 3;

  if (
    (lastRoundNumber === 3 && round !== 1) ||
    (lastRoundNumber !== 3 && round - lastRoundNumber !== 1)
  ) {
    throw new Error('Wrong round');
  }

  const players = round === 3 ? addrs.slice(0, 1) : last(rounds).players;

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
    await web3.eth.sendSignedTransaction(
      distributionTx.toRaw().toString('hex')
    );
  }

  response.send('Ok');
});
