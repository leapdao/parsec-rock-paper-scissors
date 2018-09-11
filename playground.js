/* eslint-disable */

const Web3 = require('web3');
const { helpers, Tx } = require('parsec-lib');
const Receipt = require('./src/receipt');
const { VALUES } = require('./src/constants');

const PLASMA_PROVIDER = 'https://testnet-2.parseclabs.org';
const web3 = helpers.extendWeb3(new Web3(PLASMA_PROVIDER));

const faucetPriv =
  '0xfa359762f1ea6c392901857a6c788bedc41a4ff2df96ce1b9b5cf2e800c2dfce';
const faucetAccount = web3.eth.accounts.privateKeyToAccount(faucetPriv);
const alice = web3.eth.accounts.privateKeyToAccount(
  '0xad8e31c8862f5f86459e7cca97ac9302c5e1817077902540779eef66e21f394a'
);
const PRIV1 =
  '0x6075d1310b0b52b924624a001c191e8fc510dd45ecfb7d449367721c52bbae38';
const PRIV2 =
  '0x733b6882773a76a1ab1e535c057c87937179b44d1be1de0bb0ea23bfd009ba79';
const P1 = web3.eth.accounts.privateKeyToAccount(PRIV1);
const P2 = web3.eth.accounts.privateKeyToAccount(PRIV2);
const GAME_ADDR = '0xB549eda70D3765d5E978f2C761650CB29d4683f3';

async function transfer(acc, to, value, color) {
  const unspent = await web3.getUnspent(acc.address);
  const inputs = helpers.calcInputs(unspent, acc.address, value, color);
  const outputs = helpers.calcOutputs(
    unspent,
    inputs,
    acc.address,
    to,
    value,
    color
  );

  const tx = Tx.transfer(inputs, outputs).signAll(acc.privateKey);
  return web3.eth.sendSignedTransaction(tx.toRaw());
}

async function printBalance(label, address) {
  console.log(`${label} (${address}): ${await web3.eth.getBalance(address)}`);
}

async function fundTheFaucet() {
  await printBalance('Alice', alice.address);

  const balance = await web3.eth.getBalance(faucetAccount.address);
  if (balance === '0') {
    await transfer(alice, faucetAccount.address, 1000000, 0);
  }

  await printBalance('Faucet', faucetAccount.address);
}

async function setupTheGame() {
  await transfer(faucetAccount, P1.address, 1000, 0);
  await transfer(faucetAccount, P2.address, 1000, 0);
  await transfer(P1, GAME_ADDR, 1000, 0);
  await transfer(P2, GAME_ADDR, 1000, 0);
  await printBalance('Game', GAME_ADDR);
  await printBalance('P1', P1.address);
  await printBalance('P2', P2.address);
}

function drawGame() {
  console.log('1. ', Receipt.create(1, VALUES.ROCK, PRIV1));
  console.log('1. ', Receipt.create(1, VALUES.SCISSORS, PRIV2));
  console.log('2. ', Receipt.create(2, VALUES.PAPER, PRIV1));
  console.log('2. ', Receipt.create(2, VALUES.SCISSORS, PRIV2));
  console.log('3. ', Receipt.create(3, VALUES.SCISSORS, PRIV1));
  console.log('3. ', Receipt.create(3, VALUES.SCISSORS, PRIV2));
}

async function run() {
  drawGame();
  // await fundTheFaucet();
  await setupTheGame();
  // const unspent = await web3.getUnspent(alice.address);
  // const inputs = helpers.calcInputs(unspent, alice.address, 1000000, 0);
  // const outputs = helpers.calcOutputs(
  //   unspent,
  //   inputs,
  //   alice.address,
  //   faucetAccount.address,
  //   1000000,
  //   0
  // );
  // const tx = Tx.transfer(inputs, outputs).signAll(alice.privateKey);
  // const txResult = web3.eth.sendSignedTransaction(tx.toRaw());
  // txResult.on('transactionHash', (...args) => {
  //   console.log(args);
  // });
}

run();
