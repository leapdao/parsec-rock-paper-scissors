/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-restricted-globals, consistent-return */

const express = require('express');
const Web3 = require('web3');
const cors = require('cors');
const { helpers, Tx } = require('parsec-lib');

const calcDistribution = require('./src/calcDistribution');
const { calcScores } = require('./src/rules');

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

const rockPaperScissors = () => {
  return Math.round(Math.random() * 2);
};

const rounds = [];

const cmpPlayers = (p1, p2) => {
  return p1[0] === p2[0] && p1[1] === p2[1];
};

const getGameInfo = async address => {
  const unspent = await web3.getUnspent(address);
  const transactions = await Promise.all(
    unspent.map(u =>
      web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
    )
  );
  const addrs = transactions
    .map(t => t.from)
    .filter((addr, i, src) => src.indexOf(addr) === i)
    .slice(0, 2);
  const stake = Math.min.apply(
    null,
    transactions
      .filter(t => addrs.indexOf(t.from) > -1)
      .map(t => Number(t.value))
  );

  const lastRoundNumber = (last(rounds) && last(rounds).number) || 3;
  const newGame = last(rounds) ? last(rounds).number === 3 : true;
  const latestRounds = newGame
    ? []
    : rounds.slice(rounds.length - lastRoundNumber);

  return {
    address,
    players: addrs,
    rounds: latestRounds,
    stake,
  };
};

app.use(
  cors({
    origin: '*',
  })
);

app.get('/games', async (request, response) => {
  response.send(JSON.stringify([await getGameInfo(gameAccount.address)]));
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

  const gameInfo = await getGameInfo(gameAddr);
  if (gameInfo.players.length < 2) {
    return next(`Not enough players (${gameInfo.players.length.length})`);
  }

  const lastRoundNumber = rounds.length === 0 ? 3 : last(rounds).number;

  if (
    (lastRoundNumber === 3 && round !== 1) ||
    (lastRoundNumber !== 3 && round - lastRoundNumber !== 1)
  ) {
    return next('Wrong round');
  }
  const { players } = gameInfo;
  const newRound = {
    number: round,
    players,
    result: {
      [players[0]]: rockPaperScissors(),
      [players[1]]: rockPaperScissors(),
    },
  };

  gameInfo.rounds.push(newRound);
  rounds.push(newRound);

  if (round === 3) {
    const unspent = await web3.getUnspent(gameAddr);
    const transactions = await Promise.all(
      unspent.map(u =>
        web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
      )
    );
    const scores = calcScores(rounds.slice(round.length - 3));
    const distributionTx = calcDistribution(
      scores,
      unspent,
      transactions
    ).signAll(gameAccount.privateKey);
    await web3.eth.sendSignedTransaction(distributionTx.toRaw());
  }

  response.send(
    JSON.stringify({
      status: 'ok',
      game: gameInfo,
    })
  );
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
        message: err,
      })
    );
  }
});
