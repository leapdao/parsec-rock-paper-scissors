/**
 * Copyright (c) 2018-present, Parsec Labs (parseclabs.org)
 *
 * This source code is licensed under the Mozilla Public License Version 2.0
 * found in the LICENSE file in the root directory of this source tree.
 */

/* eslint-disable no-restricted-globals */

const express = require('express');
const Web3 = require('web3');
const { helpers, Tx } = require('parsec-lib');

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

  // check if round more then latest played round by one
  // or if 1 and latest round was 3 and played already
  // define values for players and save it
  // if it was the latest round, distribute pot

  response.send('Ok');
});
