import { Account } from 'web3/types';
import { ExtendedWeb3 } from 'parsec-lib';

import { requestFunds } from './backend';

export function getAccount(web3: ExtendedWeb3) {
  if (localStorage.getItem('wallet')) {
    return web3.eth.accounts.privateKeyToAccount(
      localStorage.getItem('wallet')
    );
  }

  const account = web3.eth.accounts.create();
  localStorage.setItem('wallet', account.privateKey);

  return account;
}

export async function requestFaucet(web3: ExtendedWeb3, account: Account) {
  const balance = await web3.eth.getBalance(account.address);
  if (Number(balance) === 0) {
    await requestFunds(account.address);
  }
}
