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
const jsonParser = require('body-parser').json;
const { helpers, Tx } = require('parsec-lib');

const calcDistribution = require('./src/calcDistribution');
const { calcScores } = require('./src/rules');
const { last, not, ADDR_REGEX, isPendingRound } = require('./src/utils');
const Receipt = require('./src/receipt');

const PLASMA_PROVIDER = 'https://testnet-2.parseclabs.org';
const web3 = helpers.extendWeb3(new Web3(PLASMA_PROVIDER));

const gamePriv =
  '0xbfafef54b578da46179c6d1964503368fd103e4d553c4ed4302d71acd3f62172';
const gameAccount = web3.eth.accounts.privateKeyToAccount(gamePriv);
const faucetPriv =
  '0xfa359762f1ea6c392901857a6c788bedc41a4ff2df96ce1b9b5cf2e800c2dfce';
const faucetAccount = web3.eth.accounts.privateKeyToAccount(faucetPriv);

const FUND_AMOUNT = 10000;

const app = express();

const rounds = [];

/* eslint-disable no-shadow */
function getLastRoundNumber(rounds) {
  if (rounds.length > 0) {
    const lastRound = last(rounds);
    const number = isPendingRound(lastRound)
      ? lastRound.number - 1
      : lastRound.number;
    return number < 1 ? 3 : number;
  }

  return 3;
}
/* eslint-enable no-shadow */

const getGameInfo = async address => {
  const distribution =
    last(rounds) &&
    last(rounds).distribution &&
    Tx.fromRaw(last(rounds).distribution);
  let tx = distribution && (await web3.eth.getTransaction(distribution.hash()));

  if (!tx && distribution) {
    tx = await web3.eth.sendSignedTransaction(distribution.toRaw());
  }

  const unspent = await web3.getUnspent(address);
  const transactions = (await Promise.all(
    unspent.map(u =>
      web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
    )
  )).sort((a, b) => a.blockNumber - b.blockNumber);
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

  const newGame = lastRoundNumber === 3 && addrs.length > 0 && tx;
  const latestRounds = newGame
    ? []
    : rounds.slice(rounds.length - lastRoundNumber);

  return {
    address,
    players: addrs.map(a => a.toLowerCase()),
    rounds: latestRounds.filter(not(isPendingRound)),
    stake,
  };
};

app.use(
  cors({
    origin: '*',
  })
);

app.use(jsonParser());

app.get('/games', async (request, response) => {
  response.send(JSON.stringify([await getGameInfo(gameAccount.address)]));
});

app.get('/state', async (request, response) => {
  response.send(JSON.stringify(rounds));
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

app.post('/submitReceipt/:gameAddr', async (request, response, next) => {
  const { gameAddr } = request.params;
  if (!ADDR_REGEX.test(gameAddr)) {
    return next('Unknown game');
  }

  try {
    const { receipt } = request.body;
    const { round, value, signer } = Receipt.parse(receipt);
    const latestRounds = rounds.slice(rounds.length - 3);
    const lastRoundNumber = getLastRoundNumber(latestRounds);

    if (
      (lastRoundNumber === 3 && round !== 1) ||
      (lastRoundNumber !== 3 && round - lastRoundNumber !== 1)
    ) {
      return next('Wrong round');
    }

    const unspent = await web3.getUnspent(gameAddr);
    const transactions = await Promise.all(
      unspent.map(u =>
        web3.eth.getTransaction(`0x${u.outpoint.hash.toString('hex')}`)
      )
    );
    const gameInfo = await getGameInfo(gameAddr);
    if (gameInfo.players.indexOf(signer) === -1) {
      return next('Not a player');
    }

    if (gameInfo.players.length < 2) {
      return next(`Not enough players (${gameInfo.players.length})`);
    }

    const [pendingRound] = latestRounds.filter(isPendingRound);
    if (pendingRound) {
      if (pendingRound.result[signer] !== undefined) {
        return next('Chosen already');
      }
      pendingRound.result[signer] = value;
    } else {
      const newRound = {
        number: round,
        players: gameInfo.players,
        stake: gameInfo.stake,
        result: {
          [signer]: value,
        },
      };
      rounds.push(newRound);
    }

    if (round === 3 && pendingRound && pendingRound.number === 3) {
      const scores = calcScores(rounds.slice(rounds.length - 3));
      const distributionTx = calcDistribution(
        scores,
        unspent,
        transactions
      ).signAll(gameAccount.privateKey);

      pendingRound.distribution = `0x${distributionTx.toRaw().toString('hex')}`;

      await web3.eth.sendSignedTransaction(distributionTx.toRaw());
    }
  } catch (err) {
    next(err);
  }

  response.send(
    JSON.stringify({
      status: 'ok',
    })
  );
});

app.listen(3005, () => {
  console.log('Listen on 3005');
});

/* eslint-disable no-unused-vars */
app.use((err, req, res, next) => {
  /* eslint-enable no-unused-vars */

  if (err) {
    res.status(500).send(
      JSON.stringify({
        message: err.message || err,
      })
    );
  }
});
